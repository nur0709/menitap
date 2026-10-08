import { createClient } from '@/lib/supabase/server'
import { matchCategory } from '@/lib/category-matcher'

interface ParsedPublicCollab {
  brandName: string
  applicationUrl: string
  categoryName?: string
  productsProvided: boolean
  compensationDetails?: string
  deliverables?: string
  requirements?: string
  deadline?: string | null
  description?: string
  isScamOrPayToPlay: boolean
}

export interface IngestionResult {
  isDigest: boolean
  ingestedCount: number
  skippedCount: number
  errors: string[]
}

/**
 * Checks if incoming email matches a known UGC casting digest or contains multiple casting briefs.
 */
export function isCastingNewsletter(sender: string, subject: string, bodyText: string): boolean {
  const combined = (sender + ' ' + subject + ' ' + bodyText.slice(0, 3000)).toLowerCase()

  const knownNewsletters = [
    'brands meet creators',
    'brandsmeetcreators',
    'ugc club',
    'ugc weekly',
    'the creator times',
    'creator opportunities',
    'collabs digest',
    'casting calls weekly',
  ]

  const matchesKnown = knownNewsletters.some((n) => combined.includes(n))
  if (matchesKnown) return true

  // Check for multi-brief indicators
  const hasDigestSubject =
    (combined.includes('casting call') || combined.includes('ugc gig') || combined.includes('brand collab')) &&
    (combined.includes('weekly') || combined.includes('digest') || combined.includes('roundup') || combined.includes('open briefs'))

  // Check for multiple application form links in body
  const formLinksCount = (bodyText.match(/https?:\/\/(?:forms\.gle|[\w.-]*typeform\.com|airtable\.com|collabs\.shopify\.com|tally\.so)[\w\d\-._~:/?#[\]@!$&'()*+,;=]*/gi) || []).length

  return hasDigestSubject || formLinksCount >= 2
}

/**
 * Normalizes an application URL for deduplication
 */
function cleanUrl(url?: string | null): string | null {
  if (!url) return null
  try {
    const parsed = new URL(url.trim())
    // Strip common tracking query params
    parsed.searchParams.delete('utm_source')
    parsed.searchParams.delete('utm_medium')
    parsed.searchParams.delete('utm_campaign')
    parsed.searchParams.delete('ref')
    return parsed.toString().replace(/\/$/, '')
  } catch {
    return url.trim().replace(/\/$/, '')
  }
}

/**
 * Calls Gemini (or Groq fallback) to parse a newsletter containing multiple brand collabs.
 */
async function parseDigestBriefsWithAI(content: {
  text: string
  sender: string
  subject: string
}): Promise<ParsedPublicCollab[]> {
  const geminiApiKey = process.env.GEMINI_API_KEY
  const groqApiKey = process.env.GROQ_API_KEY

  if (!geminiApiKey && !groqApiKey) {
    console.warn('[parseDigestBriefsWithAI] No AI API keys configured.')
    return []
  }

  const prompt = `You are an expert UGC (User Generated Content) and Creator Economy analyst.
Analyze the following newsletter email content which contains one or more public brand collaboration casting calls, influencer briefs, or PR gifting opportunities.

Extract EVERY legitimate brand opportunity into an array of objects.
Do not invent brands. Only extract genuine brand briefs mentioned in the email.
Identify if any entry is a scam or "pay-to-play" (e.g. requires creator to pay an upfront fee, purchase products without reimbursement, or pay shipping). Mark isScamOrPayToPlay: true for those.

EMAIL SENDER: ${content.sender}
EMAIL SUBJECT: ${content.subject}

EMAIL CONTENT:
${content.text.slice(0, 15000)}

Respond with STRICT JSON format:
{
  "isCastingDigest": true,
  "campaigns": [
    {
      "brandName": "Exact Brand Name",
      "applicationUrl": "https://airtable.com/... or https://forms.gle/... or https://...typeform.com/...",
      "categoryName": "TikTok UGC" or "Instagram Reels" or "YouTube Longform",
      "productsProvided": true,
      "compensationDetails": "$250" or "Gifted Product + $100" or "Free PR Box",
      "deliverables": "1x TikTok Video, 3x Stills",
      "requirements": "US creators only, TikTok > 1k followers",
      "deadline": "YYYY-MM-DD" or null,
      "description": "Brief summary of what the brand is looking for",
      "isScamOrPayToPlay": false
    }
  ]
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
            signal: AbortSignal.timeout(15000),
          }
        )

        if (res.ok) {
          const json = await res.json()
          const raw = json.candidates?.[0]?.content?.parts?.[0]?.text
          if (raw) {
            const parsed = JSON.parse(raw)
            if (Array.isArray(parsed.campaigns)) {
              return parsed.campaigns
            }
          }
        }
      } catch (err) {
        console.warn(`[parseDigestBriefsWithAI] Gemini (${model}) error:`, err)
      }
    }
  }

  // 2. Try Groq Fallback
  if (groqApiKey) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          temperature: 0.1,
        }),
        signal: AbortSignal.timeout(15000),
      })

      if (res.ok) {
        const json = await res.json()
        const raw = json.choices?.[0]?.message?.content
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed.campaigns)) {
            return parsed.campaigns
          }
        }
      }
    } catch (err) {
      console.warn('[parseDigestBriefsWithAI] Groq fallback error:', err)
    }
  }

  return []
}

/**
 * End-to-end ingest function: parses newsletter, filters out scams, deduplicates against DB, and inserts into brand_links.
 */
export async function ingestNewsletterCollabs(params: {
  sender: string
  subject: string
  bodyText: string
  rawSource?: string
}): Promise<IngestionResult> {
  const isDigest = isCastingNewsletter(params.sender, params.subject, params.bodyText)
  if (!isDigest) {
    return { isDigest: false, ingestedCount: 0, skippedCount: 0, errors: [] }
  }

  const extractedCampaigns = await parseDigestBriefsWithAI({
    text: params.bodyText,
    sender: params.sender,
    subject: params.subject,
  })

  if (!extractedCampaigns || extractedCampaigns.length === 0) {
    return { isDigest: true, ingestedCount: 0, skippedCount: 0, errors: ['No campaigns extracted from digest'] }
  }

  const supabase = await createClient()

  // Fetch active categories for CREATORS to map category_id
  const { data: creatorCategories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('type', 'CREATORS')
    .eq('is_active', true)

  const defaultCategory = creatorCategories?.[0]?.id || 7 // Fallback to TikTok UGC (id 7)

  // Fetch existing application URLs from the last 60 days to avoid duplicate inserts
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
  const { data: existingLinks } = await supabase
    .from('brand_links')
    .select('application_url, brand_name')
    .gt('created_at', sixtyDaysAgo)

  const existingUrls = new Set(
    (existingLinks || []).map((l) => cleanUrl(l.application_url)).filter(Boolean)
  )

  let ingestedCount = 0
  let skippedCount = 0
  const errors: string[] = []

  for (const campaign of extractedCampaigns) {
    // 1. Skip scams or pay-to-play
    if (campaign.isScamOrPayToPlay) {
      skippedCount++
      continue
    }

    const cleanedUrl = cleanUrl(campaign.applicationUrl)
    if (!cleanedUrl || !cleanedUrl.startsWith('http')) {
      skippedCount++
      continue
    }

    // 2. Skip duplicates
    if (existingUrls.has(cleanedUrl)) {
      skippedCount++
      continue
    }

    // 3. Resolve category_id with synonym matching
    let categoryId = defaultCategory
    if (creatorCategories && creatorCategories.length > 0) {
      const match = matchCategory(
        campaign.categoryName || `${campaign.brandName} ${campaign.description || ''}`,
        creatorCategories
      )
      if (match) categoryId = match.id
    }

    // 4. Compute expiration (default to 14 days if no deadline)
    let deadlineIso: string | null = null
    if (campaign.deadline) {
      const d = new Date(campaign.deadline)
      if (!isNaN(d.getTime())) deadlineIso = d.toISOString()
    }

    const expiresAt = deadlineIso || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()

    // 5. Insert into brand_links
    const { error: insertError } = await supabase.from('brand_links').insert({
      brand_name: campaign.brandName.trim(),
      application_url: cleanedUrl,
      category_id: categoryId,
      products_provided: Boolean(campaign.productsProvided),
      compensation_details: campaign.compensationDetails?.trim() || null,
      deliverables: campaign.deliverables?.trim() || null,
      requirements: campaign.requirements?.trim() || null,
      description: campaign.description?.trim() || null,
      deadline: deadlineIso,
      expires_at: expiresAt,
      source_platform: 'NEWSLETTER',
      source_raw_text: params.bodyText.slice(0, 1000),
      is_verified: true,
      status: 'ACTIVE',
    })

    if (insertError) {
      console.error(`[ingestNewsletterCollabs] Insert failed for ${campaign.brandName}:`, insertError)
      errors.push(`${campaign.brandName}: ${insertError.message}`)
    } else {
      ingestedCount++
      existingUrls.add(cleanedUrl)
    }
  }

  return {
    isDigest: true,
    ingestedCount,
    skippedCount,
    errors,
  }
}
