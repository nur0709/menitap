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
 * Fast regex pre-filter to instantly reject obvious non-collaboration / system noise
 */
export function isObviouslyNotCollaboration(sender: string, subject: string): boolean {
  const senderLower = sender.toLowerCase()
  const subjectLower = subject.toLowerCase()

  // 1. Obvious automated system / non-collab senders
  const nonCollabSenders = [
    'messages-noreply@linkedin.com',
    'notifications@linkedin.com',
    'uspsinformeddelivery@',
    'order2@shein.com',
    'orders@',
    'order@',
    'support@vipis.com',
    'noreply@backstage.com',
    'campaigns@sr.smartrecruiters.app',
    'billing@',
    'receipts@',
    'receipt@',
    'no-reply@accounts.google.com',
    'security@',
    'notifications@',
    'digest@',
  ]
  if (nonCollabSenders.some((s) => senderLower.includes(s))) {
    return true
  }

  // 2. High-confidence transactional / personal / automated subject lines
  const nonCollabSubjects = [
    'daily digest',
    'order delivery notification',
    'order confirmation',
    'shipping confirmation',
    'viewed your profile',
    'job recommendations',
    'sports photos are ready',
    'last meet + sectional',
    'rsvp for our',
    'someone you may know',
    'security alert',
    'password reset',
    'your order has shipped',
    'explore 1,500+ roles',
  ]
  if (nonCollabSubjects.some((s) => subjectLower.includes(s))) {
    return true
  }

  return false
}

/**
 * AI-powered email extractor with strict collaboration classifier
 */
export async function parseEmailToCampaignCard(params: {
  text: string
  sender: string
  subject: string
}): Promise<ParsedEmailCard | null> {
  const { sender, subject, cleanBody } = extractOriginalEmailDetails(
    params.text,
    params.sender,
    params.subject
  )

  // 1. Fast pre-filter check
  if (isObviouslyNotCollaboration(sender, subject)) {
    console.log(`[parseEmailToCampaignCard] Fast-filtered non-collab email: "${subject}" from "${sender}"`)
    return null
  }

  const geminiApiKey = process.env.GEMINI_API_KEY
  const groqApiKey = process.env.GROQ_API_KEY

  const prompt = `You are an expert UGC creator gatekeeper and campaign assistant for Menitap.
Analyze this incoming email received by a content creator:

From: ${sender}
Subject: ${subject}
Email Content:
${cleanBody.slice(0, 3000)}

YOUR FIRST AND MOST IMPORTANT TASK: Determine "isCollaboration".
- Set "isCollaboration": true ONLY if this email is an authentic brand collaboration pitch, paid sponsorship, PR gifting / seeding offer, UGC video inquiry, casting invitation, or follow-up regarding creator deliverables/videos.
- Set "isCollaboration": false if this email is:
  * A retail/store sales newsletter or promotional blast ("Cashmere is on sale today", 20% off promos, consumer marketing).
  * An e-commerce purchase receipt, shipping update, or tracking notification (SHEIN, Amazon, USPS, etc.).
  * A personal, school, family, sports club, or community message.
  * A job board digest, general recruiter message, or employment alert (LinkedIn, Backstage, SmartRecruiters, Indeed).
  * A social media notification ("X people viewed your profile").
  * Spam or administrative notifications.

RETURN ONLY VALID JSON:
If "isCollaboration" is false:
{
  "isCollaboration": false,
  "rejectionReason": "Brief explanation"
}

If "isCollaboration" is true:
{
  "isCollaboration": true,
  "brandName": "Brand Name",
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
): ParsedEmailCard | null {
  if (parsed.isCollaboration === false) {
    console.log(
      `[parseEmailToCampaignCard] AI rejected non-collab email: ${parsed.rejectionReason || 'Not a collab'}`
    )
    return null
  }

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
): ParsedEmailCard | null {
  const combined = (subject + ' ' + body).toLowerCase()

  // Must have clear collaboration signals
  const collabKeywords = [
    'collab',
    'collaboration',
    'ugc',
    'creator',
    'gifted',
    'partnership',
    'sponsor',
    'sponsorship',
    'pr package',
    'seeding',
    'deliverables',
    'rate card',
    'reels',
    'tiktok',
    'campaign',
  ]

  const hasCollabKeyword = collabKeywords.some((k) => combined.includes(k))
  if (!hasCollabKeyword) {
    return null
  }

  // Reject general retail marketing newsletter
  if (
    combined.includes('unsubscribe') &&
    (combined.includes('sale today') || combined.includes('off entire order') || combined.includes('shop now')) &&
    !combined.includes('deliverable') &&
    !combined.includes('gifted') &&
    !combined.includes('collaboration')
  ) {
    return null
  }

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
