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
function extractOriginalEmailDetails(rawText: string, defaultSender: string, defaultSubject: string) {
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
 * Normalizes email subject line for campaign deduplication
 * Strips Re:, Fwd:, brackets, emojis, and normalizes spacing
 */
export function normalizeCampaignSubject(subject: string): string {
  if (!subject) return ''
  return subject
    .replace(/^(\s*(re|fwd|fw)\s*:\s*)+/i, '') // strip Re:, Fwd: prefixes
    .replace(/\[[^\]]+\]/g, '') // strip bracket tags like [Lepique]
    .replace(/【[^】]+】/g, '')
    .replace(/[^\w\s]/gi, ' ') // strip punctuation and symbols
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

/**
 * Fast regex pre-filter to instantly reject non-collaboration emails, retail newsletters, and system noise
 */
export function isObviouslyNotCollaboration(sender: string, subject: string, bodyText?: string): boolean {
  const senderLower = sender.toLowerCase().trim()
  const subjectLower = subject.toLowerCase().trim()
  const bodyLower = (bodyText || '').toLowerCase()

  // 1. Obvious automated system / non-collab senders
  const nonCollabSenders = [
    '@linkedin.com',
    'jobalerts',
    'smartrecruiters.app',
    'backstage.com',
    'uspsinformeddelivery@',
    'shein.com',
    'orders@',
    'order@',
    'order2@',
    'billing@',
    'receipts@',
    'receipt@',
    'no-reply@accounts.google.com',
    'security@',
    'notifications@',
    'digest@',
    'support@vipis.com',
    'news@g.factor75.com',
    'hello@mail.quince.com',
    'info@nakedsundays.com',
    'hello@pitchlo.com',
    'clientservices@lightfolio.com',
    'tkile@kcsd96.org',
    'mcastro@casacentral.org',
    'david@welcome.facecardhq.com',
    'zoom.us',
    'youtube.com',
    'loom.com',
    'vimeo.com',
    'github.com',
    'figma.com',
    'notion.so',
    'slack.com',
    'spotify.com',
  ]
  if (nonCollabSenders.some((s) => senderLower.includes(s))) {
    return true
  }

  // School and education domains
  if (senderLower.includes('.k12.') || senderLower.includes('.schools.') || senderLower.includes('@kcsd96.org')) {
    return true
  }

  // 2. High-confidence transactional / personal / automated subject lines
  const nonCollabSubjects = [
    'daily digest',
    'weekly digest',
    'creator pulse',
    'order delivery notification',
    'order confirmation',
    'shipping confirmation',
    'your order has shipped',
    'viewed your profile',
    'job recommendations',
    'job alert',
    'actively hiring',
    'sports photos are ready',
    'last meet + sectional',
    'sectional roster',
    'rsvp for our',
    'someone you may know',
    'security alert',
    'password reset',
    'explore 1,500+ roles',
    'want 10% off',
    '10% off your next order',
    'cashmere is on sale today',
    'zero strings attached',
    'delicious routines',
    'you\'re in - one thing first',
    'creative mixer invite',
    'convening on',
    'watch the roomer pro recording',
    'missed it? watch the',
    'super brand day',
    'prime deals are here',
    'the slippers everyone',
    'photo gallery',
    'invitation to collaborate on',
    'shared a document with you',
  ]
  if (nonCollabSubjects.some((s) => subjectLower.includes(s))) {
    return true
  }

  // 3. Discount / coupon / promo codes in subject
  if (
    subjectLower.includes('% off') ||
    subjectLower.includes('promo code') ||
    subjectLower.includes('coupon') ||
    subjectLower.includes('sale today') ||
    subjectLower.includes('flash sale')
  ) {
    return true
  }

  // 4. If newsletter markers are prominent in body and sender is generic info/news
  if (
    (senderLower.startsWith('news@') ||
      senderLower.startsWith('newsletter@') ||
      senderLower.startsWith('marketing@') ||
      senderLower.startsWith('info@')) &&
    bodyLower.includes('unsubscribe') &&
    (bodyLower.includes('view in browser') || bodyLower.includes('privacy policy') || bodyLower.includes('cart')) &&
    !bodyLower.includes('deliverable') &&
    !bodyLower.includes('paid partnership') &&
    !bodyLower.includes('gifting')
  ) {
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
  userEmail?: string
}): Promise<ParsedEmailCard | null> {
  const { sender, subject, cleanBody } = extractOriginalEmailDetails(
    params.text,
    params.sender,
    params.subject
  )

  // 1. Fast pre-filter check
  if (isObviouslyNotCollaboration(sender, subject, cleanBody)) {
    console.log(`[parseEmailToCampaignCard] Fast-filtered non-collab email: "${subject}" from "${sender}"`)
    return null
  }

  // Skip self-sent emails if userEmail provided
  if (params.userEmail && sender.toLowerCase().includes(params.userEmail.toLowerCase())) {
    console.log(`[parseEmailToCampaignCard] Skipped self-sent email from "${sender}"`)
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
- Set "isCollaboration": true ONLY if this email is an authentic, direct brand collaboration pitch, paid sponsorship offer, PR gifting/product seeding offer, UGC video brief, or follow-up from a brand or PR agency regarding creator video deliverables.
- Set "isCollaboration": false if this email is:
  * A retail store sales blast, marketing promotional newsletter, discount coupon, or consumer marketing (e.g. Factor75, Quince, Naked Sundays, SHEIN, Zara).
  * An affiliate-only program without guaranteed compensation or gifting (e.g. "join our affiliate program and earn 10% commission on links").
  * An e-commerce purchase receipt, tracking email, or shipping update.
  * A job alert, job board digest, general recruiter message, or employment email (LinkedIn, Backstage, SmartRecruiters, Indeed).
  * An event, mixer, webinar replay, community convening, school, or club notification.
  * A photo gallery delivery, SaaS collaboration notice (Figma, GitHub, Google Docs), or personal email.
  * Spam or automated system notification.
- Set "deadline": Look for submission deadlines, draft due dates, post dates, video due dates, or campaign timelines (e.g. "submit draft by Oct 24th", "campaign ends Oct 31", "post before Friday").
  If a date is mentioned, return it as an ISO 8601 date string (YYYY-MM-DD), e.g. "2026-10-24".
  If no deadline or due date is mentioned in the email, set to null.

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
  "deadline": "2026-10-24", // or null if no deadline is specified
  "status": "NEW_PITCH"
}`

  // 1. Try Gemini
  if (geminiApiKey) {
    const models = ['gemini-2.0-flash', 'gemini-1.5-flash']
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

  // 3. Fallback Heuristics (Safe-by-default, fail-closed)
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
    deadline: (() => {
      if (parsed.deadline && typeof parsed.deadline === 'string' && parsed.deadline.trim()) {
        const d = new Date(parsed.deadline.trim())
        return isNaN(d.getTime()) ? null : d.toISOString()
      }
      return null
    })(),
    status,
    cleanSender: sender,
    cleanSubject: subject,
  }
}

/**
 * Strict, fail-closed heuristic fallback.
 * Only accepts emails that have clear compound proof of an authentic brand sponsorship pitch.
 * When in doubt, returns null to avoid spamming the creator's board.
 */
function fallbackHeuristicParser(
  body: string,
  sender: string,
  subject: string
): ParsedEmailCard | null {
  const combined = (subject + ' ' + body).toLowerCase()

  // 1. Instant rejection of retail promotional emails & newsletters
  if (
    combined.includes('unsubscribe') ||
    combined.includes('view in browser') ||
    combined.includes('manage your preferences') ||
    combined.includes('% off') ||
    combined.includes('coupon code') ||
    combined.includes('shop now') ||
    combined.includes('cart') ||
    combined.includes('order number') ||
    combined.includes('shipping tracking')
  ) {
    return null
  }

  // 2. Must contain high-confidence explicit collaboration intent phrases
  const highConfidenceIntent = [
    'paid partnership',
    'paid collaboration',
    'paid tiktok collaboration',
    'paid instagram collaboration',
    'pr package',
    'gifted collaboration',
    'product seeding',
    'collaboration proposal',
    'sponsorship proposal',
    'ugc creator opportunity',
    'send you our product',
    'send you free product',
    'rate for a video',
    'rate for 1 reel',
  ]

  const hasIntent = highConfidenceIntent.some((phrase) => combined.includes(phrase))
  if (!hasIntent) {
    return null
  }

  // 3. Must ALSO contain compensation or deliverables signal
  const compensationSignal =
    /\$\s*\d{2,4}/.test(combined) ||
    combined.includes('budget') ||
    combined.includes('rate card') ||
    combined.includes('compensation') ||
    combined.includes('gifted') ||
    combined.includes('free product')

  const deliverablesSignal =
    combined.includes('deliverable') ||
    combined.includes('tiktok') ||
    combined.includes('reel') ||
    combined.includes('video') ||
    combined.includes('post')

  if (!compensationSignal || !deliverablesSignal) {
    return null
  }

  // Derive brand name cleanly
  let derivedBrand = 'Brand Partner'
  const domainMatch = sender.match(/@([a-zA-Z0-9.-]+)/)
  if (domainMatch && domainMatch[1]) {
    const raw = domainMatch[1].replace(/\.(com|co|io|net|org|app|us|kr)$/i, '')
    const parts = raw.split('.')
    const name = parts[parts.length - 1] || 'Brand'
    if (!['gmail', 'yahoo', 'hotmail', 'outlook', 'icloud'].includes(name.toLowerCase())) {
      derivedBrand = name.charAt(0).toUpperCase() + name.slice(1)
    }
  }

  // Extract pay if present
  const payMatch = body.match(/\$\s*(\d{1,4}(?:,\d{3})*)/)
  const compensation = payMatch ? `$${payMatch[1]}` : 'Gifted / TBD'

  // Extract deadline if mentioned
  let deadline: string | null = null
  const deadlineMatch = body.match(
    /(?:due by|deadline:?|submit by|post by|deliver by|live by)\s*([A-Za-z]+ \d{1,2}(?:st|nd|rd|th)?(?:,?\s*\d{4})?|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|\d{4}-\d{2}-\d{2})/i
  )
  if (deadlineMatch && deadlineMatch[1]) {
    const rawClean = deadlineMatch[1].replace(/(st|nd|rd|th)/i, '')
    const parsedDate = new Date(rawClean)
    if (!isNaN(parsedDate.getTime())) {
      deadline = parsedDate.toISOString()
    }
  }

  return {
    brandName: derivedBrand,
    brandLogoUrl: null,
    productName: subject.slice(0, 50) || null,
    compensation,
    deliverables: 'UGC Video Deliverables',
    deadline,
    status: 'NEW_PITCH',
    cleanSender: sender,
    cleanSubject: subject,
  }
}

