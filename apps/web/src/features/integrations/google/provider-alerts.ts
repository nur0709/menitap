import { createServiceRoleClient } from '@/lib/supabase/server'
import type { ProviderIssue } from '@/features/campaigns/lib/model-json'

const QUIET_MS = 6 * 60 * 60 * 1000

/**
 * One owner note per provider failure, then quiet for 6 hours.
 * The Slack webhook is optional. The row is still saved when the service role key exists.
 */
export async function recordProviderIssues(issues: ProviderIssue[]): Promise<void> {
  const fresh: ProviderIssue[] = []
  const seen = new Set<string>()

  for (const issue of issues) {
    const key = `${issue.provider}:${issue.kind}`
    if (seen.has(key)) continue
    seen.add(key)
    if (await alertedRecently(issue)) continue
    fresh.push(issue)
  }

  if (fresh.length === 0) return

  await saveAlerts(fresh)
  await postSlack(fresh)
}

async function alertedRecently(issue: ProviderIssue): Promise<boolean> {
  const supabase = createServiceRoleClient()
  if (!supabase) return false

  const since = new Date(Date.now() - QUIET_MS).toISOString()
  const { data, error } = await supabase
    .from('parser_provider_alerts')
    .select('id')
    .eq('provider', issue.provider)
    .eq('kind', issue.kind)
    .gte('created_at', since)
    .limit(1)

  if (error) {
    console.warn('[recordProviderIssues] lookup failed:', error.message)
    return false
  }

  return (data?.length ?? 0) > 0
}

async function saveAlerts(issues: ProviderIssue[]): Promise<void> {
  const supabase = createServiceRoleClient()
  if (!supabase) return

  const { error } = await supabase.from('parser_provider_alerts').insert(
    issues.map((issue) => ({
      provider: issue.provider,
      kind: issue.kind,
      detail: issue.detail.slice(0, 180),
    }))
  )

  if (error) {
    console.warn('[recordProviderIssues] insert failed:', error.message)
  }
}

async function postSlack(issues: ProviderIssue[]): Promise<void> {
  const webhook = process.env.SLACK_OPS_WEBHOOK_URL
  if (!webhook || !webhook.startsWith('https://hooks.slack.com/')) return

  const text = issues.map(issueSentence).join('\n')
  try {
    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) {
      console.warn('[recordProviderIssues] Slack webhook failed:', res.status)
    }
  } catch (err) {
    console.warn('[recordProviderIssues] Slack webhook error:', err)
  }
}

function issueSentence(issue: ProviderIssue): string {
  const name = issue.provider === 'gemini' ? 'Gemini' : 'Groq'
  if (issue.kind === 'quota') {
    return `${name} is out of free quota. Another free key may be needed.`
  }
  if (issue.kind === 'model_retired') {
    return `${name} model name is no longer served. Change the pinned model.`
  }
  return `${name} did not respond, so the email reader could not finish.`
}
