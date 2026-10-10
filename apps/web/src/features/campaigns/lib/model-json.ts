const DEFAULT_READER_MODEL = 'gemini-3.6-flash'
const FALLBACK_READER_MODEL = 'openai/gpt-oss-120b'

const REQUEST_TIMEOUT_MS = 8000

type ProviderName = 'gemini' | 'groq'

type ProviderIssueKind = 'quota' | 'model_retired' | 'outage'

export interface ProviderIssue {
  provider: ProviderName
  kind: ProviderIssueKind
  detail: string
}

export type ModelCompletion<T> =
  | { ok: true; model: string; value: T; issues: ProviderIssue[] }
  | { ok: false; issues: ProviderIssue[] }

interface ModelAttempt {
  provider: ProviderName
  model: string
  run: (prompt: string) => Promise<{ ok: true; raw: string } | { ok: false; issue: ProviderIssue }>
}

/**
 * Gemini first. Groq only when Gemini is down or its reply is not usable JSON.
 * A keyword parser is not a third option.
 */
export async function completeWithModels<T>(
  prompt: string,
  accept: (raw: string) => T | null
): Promise<ModelCompletion<T>> {
  const issues: ProviderIssue[] = []

  for (const attempt of attempts()) {
    let result: { ok: true; raw: string } | { ok: false; issue: ProviderIssue }
    try {
      result = await attempt.run(prompt)
    } catch (err) {
      result = {
        ok: false,
        issue: {
          provider: attempt.provider,
          kind: 'outage',
          detail: err instanceof Error ? err.message : 'request failed',
        },
      }
    }

    if (!result.ok) {
      issues.push(result.issue)
      continue
    }

    const value = accept(result.raw) ?? (await retryAccepted(attempt, prompt, accept, issues))
    if (value !== null) {
      return { ok: true, model: attempt.model, value, issues }
    }

    issues.push({
      provider: attempt.provider,
      kind: 'outage',
      detail: 'Model reply was not usable JSON',
    })
  }

  return { ok: false, issues }
}

async function retryAccepted<T>(
  attempt: ModelAttempt,
  prompt: string,
  accept: (raw: string) => T | null,
  issues: ProviderIssue[]
): Promise<T | null> {
  try {
    const second = await attempt.run(prompt)
    if (!second.ok) {
      issues.push(second.issue)
      return null
    }
    return accept(second.raw)
  } catch (err) {
    issues.push({
      provider: attempt.provider,
      kind: 'outage',
      detail: err instanceof Error ? err.message : 'request failed',
    })
    return null
  }
}

export function extractJsonObject(raw: string): unknown | null {
  const trimmed = raw.trim()
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/i)
  const body = (fenced?.[1] ?? trimmed).trim()

  try {
    return JSON.parse(body)
  } catch {
    const start = body.indexOf('{')
    const end = body.lastIndexOf('}')
    if (start === -1 || end <= start) return null
    try {
      return JSON.parse(body.slice(start, end + 1))
    } catch {
      return null
    }
  }
}

function attempts(): ModelAttempt[] {
  const list: ModelAttempt[] = []
  const geminiKey = process.env.GEMINI_API_KEY
  const groqKey = process.env.GROQ_API_KEY

  if (geminiKey) {
    list.push({
      provider: 'gemini',
      model: DEFAULT_READER_MODEL,
      run: (prompt) => callGemini(geminiKey, prompt),
    })
  } else {
    list.push({
      provider: 'gemini',
      model: DEFAULT_READER_MODEL,
      run: async () => ({
        ok: false,
        issue: { provider: 'gemini', kind: 'outage', detail: 'GEMINI_API_KEY is not set' },
      }),
    })
  }

  if (groqKey) {
    list.push({
      provider: 'groq',
      model: FALLBACK_READER_MODEL,
      run: (prompt) => callGroq(groqKey, prompt),
    })
  }

  return list
}

async function callGemini(
  apiKey: string,
  prompt: string
): Promise<{ ok: true; raw: string } | { ok: false; issue: ProviderIssue }> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_READER_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    }
  )

  if (!res.ok) {
    return { ok: false, issue: await failureIssue('gemini', res) }
  }

  const json = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[]
  }
  const raw = json.candidates?.[0]?.content?.parts?.[0]?.text
  if (!raw) {
    return {
      ok: false,
      issue: { provider: 'gemini', kind: 'outage', detail: 'Empty Gemini response' },
    }
  }
  return { ok: true, raw }
}

async function callGroq(
  apiKey: string,
  prompt: string
): Promise<{ ok: true; raw: string } | { ok: false; issue: ProviderIssue }> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: FALLBACK_READER_MODEL,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })

  if (!res.ok) {
    return { ok: false, issue: await failureIssue('groq', res) }
  }

  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  const raw = json.choices?.[0]?.message?.content
  if (!raw) {
    return {
      ok: false,
      issue: { provider: 'groq', kind: 'outage', detail: 'Empty Groq response' },
    }
  }
  return { ok: true, raw }
}

async function failureIssue(provider: ProviderName, res: Response): Promise<ProviderIssue> {
  const body = (await res.text()).slice(0, 180)
  return {
    provider,
    kind: classifyFailure(res.status, body),
    detail: `${res.status} ${body}`.trim(),
  }
}

function classifyFailure(status: number, body: string): ProviderIssueKind {
  const lower = body.toLowerCase()
  if (
    status === 404 ||
    lower.includes('not found') ||
    lower.includes('decommissioned') ||
    lower.includes('no longer supported') ||
    lower.includes('model_not_found') ||
    (status === 400 && lower.includes('model'))
  ) {
    return 'model_retired'
  }
  if (
    status === 429 ||
    lower.includes('resource_exhausted') ||
    lower.includes('quota') ||
    lower.includes('rate limit') ||
    lower.includes('rate_limit')
  ) {
    return 'quota'
  }
  return 'outage'
}
