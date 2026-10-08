import { createClient } from '@/lib/supabase/server'

interface RedditPostItem {
  id: string
  title: string
  link: string
  content: string
  author: string
}

export interface CommunityScraperResult {
  scannedPosts: number
  ingestedCount: number
  skippedCount: number
  errors: string[]
}

/**
 * Strips HTML tags and decodes common entities
 */
function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Extracts candidate application form links from text/HTML
 */
function extractApplicationLinks(text: string): string[] {
  const matches = text.match(
    /https?:\/\/(?:forms\.gle|[\w.-]*typeform\.com|airtable\.com\/(?:app|shr)[\w]+|tally\.so|collabs\.shopify\.com|docs\.google\.com\/forms)[\w\d\-._~:/?#[\]@!$&'()*+,;=]*/gi
  )
  return Array.from(new Set(matches || []))
}

/**
 * Fetches and parses Atom RSS feed from Reddit subreddits
 */
async function fetchSubredditRss(subreddit: string): Promise<RedditPostItem[]> {
  const url = `https://www.reddit.com/r/${subreddit}/new/.rss`
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    signal: AbortSignal.timeout(10000),
  })

  if (!res.ok) {
    console.warn(`[community-scraper] Failed to fetch r/${subreddit}: ${res.statusText}`)
    return []
  }

  const xml = await res.text()
  const entries: RedditPostItem[] = []

  // Simple, fast regex parser for standard Atom entry blocks
  const entryMatches = xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)
  for (const match of entryMatches) {
    const block = match[1]
    const titleMatch = block.match(/<title>([\s\S]*?)<\/title>/)
    const linkMatch = block.match(/<link\s+href="([^"]+)"/)
    const idMatch = block.match(/<id>([\s\S]*?)<\/id>/)
    const contentMatch = block.match(/<content[^>]*>([\s\S]*?)<\/content>/)
    const authorMatch = block.match(/<author>[\s\S]*?<name>([\s\S]*?)<\/name>/)

    const title = titleMatch ? stripHtml(titleMatch[1]) : ''
    const link = linkMatch ? linkMatch[1] : ''
    const id = idMatch ? idMatch[1] : link
    const content = contentMatch ? stripHtml(contentMatch[1]) : ''
    const author = authorMatch ? stripHtml(authorMatch[1]) : ''

    if (title && link) {
      entries.push({ id, title, link, content, author })
    }
  }

  return entries
}

/**
 * AI extraction for Reddit community casting call post
 */
async function parseRedditPostWithAI(post: RedditPostItem): Promise<{
  isLegitimateCollab: boolean
  brandName?: string
  applicationUrl?: string
  compensation?: string
  deliverables?: string
  requirements?: string
  deadline?: string | null
  description?: string
  isScamOrPayToPlay: boolean
} | null> {
  const geminiApiKey = process.env.GEMINI_API_KEY
  const groqApiKey = process.env.GROQ_API_KEY

  if (!geminiApiKey && !groqApiKey) return null

  const prompt = `Analyze this Reddit post from a creator community to check if it is a LEGITIMATE brand collaboration casting call or agency looking for creators.
POST TITLE: ${post.title}
POST CONTENT: ${post.content}
POST URL: ${post.link}

Respond in STRICT JSON:
{
  "isLegitimateCollab": true or false,
  "brandName": "Brand or Agency Name",
  "applicationUrl": "https://...",
  "compensation": "$250" or "Gifted Product" or "TBD",
  "deliverables": "1x TikTok Video" or "UGC Review",
  "requirements": "US creators only" or null,
  "deadline": "YYYY-MM-DD" or null,
  "description": "Short brief summary",
  "isScamOrPayToPlay": false
}

Rules:
- If this is just a creator asking a question, discussing rates, or venting, set "isLegitimateCollab": false.
- If it requires creators to pay upfront fees or buy products without reimbursement, set "isScamOrPayToPlay": true.`

  if (geminiApiKey) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
          signal: AbortSignal.timeout(12000),
        }
      )

      if (res.ok) {
        const json = await res.json()
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text
        if (text) return JSON.parse(text)
      }
    } catch (err) {
      console.warn('[community-scraper] Gemini extraction error:', err)
    }
  }

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
        }),
        signal: AbortSignal.timeout(12000),
      })

      if (res.ok) {
        const json = await res.json()
        const text = json.choices?.[0]?.message?.content
        if (text) return JSON.parse(text)
      }
    } catch (err) {
      console.warn('[community-scraper] Groq extraction error:', err)
    }
  }

  return null
}

/**
 * Main ingestion routine for community casting boards
 */
export async function syncCommunityCollabs(): Promise<CommunityScraperResult> {
  const subreddits = ['UGCcreators', 'influencermarketing']
  let allPosts: RedditPostItem[] = []

  for (const sub of subreddits) {
    try {
      const posts = await fetchSubredditRss(sub)
      allPosts = allPosts.concat(posts)
    } catch (err) {
      console.warn(`[community-scraper] Error polling r/${sub}:`, err)
    }
  }

  const supabase = await createClient()

  // Pre-filter: only inspect posts that contain keywords OR application form URLs
  const candidatePosts = allPosts.filter((post) => {
    const text = (post.title + ' ' + post.content).toLowerCase()
    const formUrls = extractApplicationLinks(text)
    const hasCollabKeywords =
      text.includes('casting call') ||
      text.includes('looking for ugc') ||
      text.includes('hiring ugc') ||
      text.includes('brand collab') ||
      text.includes('paid partnership') ||
      text.includes('pr package')

    return formUrls.length > 0 || hasCollabKeywords
  })

  // Fetch existing application links to deduplicate
  const { data: existingLinks } = await supabase.from('brand_links').select('application_url')
  const existingUrls = new Set(
    (existingLinks || []).map((l) => l.application_url.trim().replace(/\/$/, '')).filter(Boolean)
  )

  let ingestedCount = 0
  let skippedCount = 0
  const errors: string[] = []

  for (const post of candidatePosts.slice(0, 15)) {
    try {
      const parsed = await parseRedditPostWithAI(post)
      if (!parsed || !parsed.isLegitimateCollab || parsed.isScamOrPayToPlay) {
        skippedCount++
        continue
      }

      // Check URL validity
      const rawUrl = parsed.applicationUrl || extractApplicationLinks(post.content)[0] || post.link
      const cleanUrl = rawUrl.trim().replace(/\/$/, '')

      if (existingUrls.has(cleanUrl)) {
        skippedCount++
        continue
      }

      const brand = parsed.brandName?.trim() || 'Brand Partner'
      const expiresAt = parsed.deadline
        ? new Date(parsed.deadline).toISOString()
        : new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()

      const { error: insertErr } = await supabase.from('brand_links').insert({
        brand_name: brand,
        application_url: cleanUrl,
        category_id: 7, // Default to TikTok UGC
        products_provided: true,
        compensation_details: parsed.compensation || 'Gifted / TBD',
        deliverables: parsed.deliverables || 'UGC Video Deliverable',
        requirements: parsed.requirements || null,
        description: parsed.description || post.title,
        deadline: parsed.deadline ? new Date(parsed.deadline).toISOString() : null,
        expires_at: expiresAt,
        source_platform: 'REDDIT',
        source_url: post.link,
        source_raw_text: post.content.slice(0, 500),
        status: 'ACTIVE',
        is_verified: false,
      })

      if (insertErr) {
        errors.push(`${brand}: ${insertErr.message}`)
      } else {
        ingestedCount++
        existingUrls.add(cleanUrl)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(`Post ${post.id}: ${msg}`)
    }
  }

  return {
    scannedPosts: allPosts.length,
    ingestedCount,
    skippedCount,
    errors,
  }
}
