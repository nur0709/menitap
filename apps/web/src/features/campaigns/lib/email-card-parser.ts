import { CampaignStatus } from '../types'

export interface ParsedEmailCard {
  brandName: string
  brandLogoUrl: string | null
  productName: string | null
  compensation: string | null
  deliverables: string | null
  deadline: string | null
  status: CampaignStatus
  cleanSender: string
  cleanSubject: string
}

/**
 * Parses forwarded email headers (e.g. Gmail / Apple Mail forwarded blocks)
 */
export function extractOriginalEmailDetails(rawText: string, defaultSender: string, defaultSubject: string) {
  let sender = defaultSender
  let subject = defaultSubject
  let cleanBody = rawText

  const forwardedMatch = rawText.match(/[-]{3,}\s*Forwarded message\s*[-]{3,}/i)
  if (forwardedMatch && forwardedMatch.index !== undefined) {
    const afterMarker = rawText.slice(forwardedMatch.index)

    const fromMatch = afterMarker.match(/From:\s*([^\r\n]+)/i)
    if (fromMatch && fromMatch[1]) {
      sender = fromMatch[1].trim()
    }

    const subjectMatch = afterMarker.match(/Subject:\s*([^\r\n]+)/i)
    if (subjectMatch && subjectMatch[1]) {
      subject = subjectMatch[1].trim()
    }

    const dateMatch = afterMarker.match(/Date:\s*([^\r\n]+)/i)
    if (dateMatch && dateMatch.index !== undefined) {
      // Body typically begins after Date/To/Subject lines
      const bodyStartIndex = afterMarker.indexOf('\n\n', dateMatch.index)
      if (bodyStartIndex !== -1) {
        cleanBody = afterMarker.slice(bodyStartIndex).trim()
      }
    }
  }

  return { sender, subject, cleanBody }
}

/**
 * AI-powered email extractor using Gemini / Groq with heuristics fallback
 */
export async function parseEmailToCampaignCard(params: {
  text: string
  sender: string
  subject: string
}): Promise<ParsedEmailCard> {
  const { sender, subject, cleanBody } = extractOriginalEmailDetails(
    params.text,
    params.sender,
    params.subject
  )

  const geminiApiKey = process.env.GEMINI_API_KEY
  const groqApiKey = process.env.GROQ_API_KEY

  const prompt = `You are an expert UGC creator assistant for Menitap.
Analyze this incoming email from a brand or PR agency:

From: ${sender}
Subject: ${subject}
Email Content:
${cleanBody.slice(0, 3000)}

Extract the following deal details into strict JSON:
1. "brandName": Clean company or brand name (e.g. "Gymshark", "Glossier", "Beekman 1802", "Anker").
2. "brandDomain": Brand domain without https/www (e.g. "gymshark.com", "glossier.com") if identifiable, else null.
3. "productName": Specific product or collection mentioned (e.g. "Seamless Training Set", "Milk Primer") or null.
4. "compensation": Agreed or offered payment (e.g. "$350", "$200 + Product", "Gifted + 15% Comm"). If not mentioned, return "Gifted / TBD".
5. "deliverables": Required creator deliverables (e.g. "1x 30s TikTok Video (9:16)", "2x Instagram Stories + Raw Files").
6. "deadline": Target due date if mentioned (format as ISO string YYYY-MM-DD), else null.
7. "status": "NEW_PITCH" | "ACCEPTED" | "FILMING" (default to "NEW_PITCH").

Return ONLY valid JSON matching this schema:
{
  "brandName": "Brand",
  "brandDomain": "brand.com",
  "productName": "Product Name",
  "compensation": "$300",
  "deliverables": "1x TikTok Video",
  "deadline": null,
  "status": "NEW_PITCH"
}`

  // 1. Try Gemini
  if (geminiApiKey) {
    const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash']
    for (const model of models) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json' },
            }),
            signal: AbortSignal.timeout(8000),
          }
        )

        if (res.ok) {
          const json = await res.json()
          const raw = json.candidates?.[0]?.content?.parts?.[0]?.text
          if (raw) {
            const parsed = JSON.parse(raw)
            return formatParsedCard(parsed, sender, subject)
          }
        }
      } catch (err) {
        console.warn(`[parseEmailToCampaignCard] Gemini (${model}) failed:`, err)
      }
    }
  }

  // 2. Try Groq
  if (groqApiKey) {
    const groqModels = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant']
    for (const model of groqModels) {
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${groqApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.1,
          }),
          signal: AbortSignal.timeout(8000),
        })

        if (res.ok) {
          const json = await res.json()
          const raw = json.choices?.[0]?.message?.content
          if (raw) {
            const parsed = JSON.parse(raw)
            return formatParsedCard(parsed, sender, subject)
          }
        }
      } catch (err) {
        console.warn(`[parseEmailToCampaignCard] Groq (${model}) failed:`, err)
      }
    }
  }

  // 3. Fallback Heuristics (Rule-based)
  return fallbackHeuristicParser(cleanBody, sender, subject)
}

function formatParsedCard(
  parsed: Record<string, unknown>,
  sender: string,
  subject: string
): ParsedEmailCard {
  const brandName = (parsed.brandName as string)?.trim() || 'Brand Partner'
  const brandDomain = (parsed.brandDomain as string)?.trim() || null

  let logoUrl: string | null = null
  if (brandDomain) {
    logoUrl = `https://www.google.com/s2/favicons?domain=${brandDomain}&sz=128`
  }

  const validStatuses: CampaignStatus[] = [
    'NEW_PITCH',
    'REVIEWED',
    'ACCEPTED',
    'FILMING',
    'DELIVERED',
    'PAID',
    'DECLINED',
  ]
  const parsedStatus = parsed.status as CampaignStatus
  const status: CampaignStatus = validStatuses.includes(parsedStatus) ? parsedStatus : 'NEW_PITCH'

  return {
    brandName,
    brandLogoUrl: logoUrl,
    productName: (parsed.productName as string)?.trim() || null,
    compensation: (parsed.compensation as string)?.trim() || 'Gifted / TBD',
    deliverables: (parsed.deliverables as string)?.trim() || 'UGC Content Review',
    deadline: (parsed.deadline as string)?.trim() || null,
    status,
    cleanSender: sender,
    cleanSubject: subject,
  }
}

function fallbackHeuristicParser(
  body: string,
  sender: string,
  subject: string
): ParsedEmailCard {
  // Extract brand from subject or sender
  let derivedBrand = 'Brand Partner'
  const domainMatch = sender.match(/@([a-zA-Z0-9.-]+)/)
  if (domainMatch && domainMatch[1]) {
    const raw = domainMatch[1].replace(/\.(com|co|io|net|org|app|us)$/i, '')
    const parts = raw.split('.')
    const name = parts[parts.length - 1] || 'Brand'
    if (!['gmail', 'yahoo', 'hotmail', 'outlook', 'icloud'].includes(name.toLowerCase())) {
      derivedBrand = name.charAt(0).toUpperCase() + name.slice(1)
    }
  }

  // Extract pay
  const payMatch = body.match(/\$\s*(\d{1,4}(?:,\d{3})*)/)
  const compensation = payMatch ? `$${payMatch[1]}` : 'Gifted / TBD'

  return {
    brandName: derivedBrand,
    brandLogoUrl: null,
    productName: subject.slice(0, 40) || null,
    compensation,
    deliverables: '1x UGC Video / Social Post',
    deadline: null,
    status: 'NEW_PITCH',
    cleanSender: sender,
    cleanSubject: subject,
  }
}
