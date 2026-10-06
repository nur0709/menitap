import * as cheerio from 'cheerio'

export interface ParsedLinkMetadata {
  title?: string
  brandName?: string
  description?: string
  imageUrl?: string
  logoUrl?: string
  compensationType?: 'FREE_PRODUCT' | 'PAID' | 'COMMISSION' | 'GIFTING'
  suggestedCategory?: string
  source: 'ai_gemini' | 'ai_groq' | 'opengraph'
}

/**
 * 1. OpenGraph / HTML Fallback Parser (Zero-cost, 100% reliable)
 */
export async function extractOpenGraphMetadata(targetUrl: string): Promise<ParsedLinkMetadata> {
  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch page: HTTP ${res.status}`)
    }

    const html = await res.text()
    const $ = cheerio.load(html)

    const ogTitle = $('meta[property="og:title"]').attr('content') || $('title').text() || ''
    const ogSiteName = $('meta[property="og:site_name"]').attr('content') || ''
    const ogDesc = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || ''
    const ogImage = $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content') || ''

    // Derive brand name from domain or site_name
    let derivedBrand = ogSiteName
    if (!derivedBrand) {
      try {
        const parsedUrl = new URL(targetUrl)
        const hostname = parsedUrl.hostname.replace(/^www\./, '').split('.')[0]
        if (hostname) {
          derivedBrand = hostname.charAt(0).toUpperCase() + hostname.slice(1)
        }
      } catch {
        derivedBrand = ''
      }
    }

    return {
      title: ogTitle.trim(),
      brandName: derivedBrand.trim(),
      description: ogDesc.trim(),
      imageUrl: ogImage.trim(),
      source: 'opengraph',
    }
  } catch (error) {
    console.warn('[extractOpenGraphMetadata] Error parsing URL:', error)
    // Fallback: extract domain name
    let fallbackBrand = ''
    try {
      const parsedUrl = new URL(targetUrl)
      fallbackBrand = parsedUrl.hostname.replace(/^www\./, '').split('.')[0]
      fallbackBrand = fallbackBrand.charAt(0).toUpperCase() + fallbackBrand.slice(1)
    } catch {
      // ignore
    }

    return {
      brandName: fallbackBrand,
      source: 'opengraph',
    }
  }
}

/**
 * 2. Multi-tier AI Parser (Gemini -> Groq -> OpenGraph Fallback)
 */
export async function smartExtractCampaignMetadata(targetUrl: string): Promise<ParsedLinkMetadata> {
  // Always fetch the baseline HTML/OpenGraph first so we have accurate page content to feed AI
  const ogData = await extractOpenGraphMetadata(targetUrl)

  const geminiApiKey = process.env.GEMINI_API_KEY
  const groqApiKey = process.env.GROQ_API_KEY

  // If no AI keys are configured, return the OpenGraph metadata directly
  if (!geminiApiKey && !groqApiKey) {
    return ogData
  }

  const prompt = `Analyze this brand or product campaign URL:
URL: ${targetUrl}
Page Title: ${ogData.title || 'N/A'}
Page Description: ${ogData.description || 'N/A'}
Site Name: ${ogData.brandName || 'N/A'}

Respond ONLY with valid JSON with these fields:
{
  "brandName": "Brand or company name",
  "title": "Clean short campaign or product title (max 60 chars)",
  "description": "Engaging 1-2 sentence description for UGC creators (max 160 chars)",
  "compensationType": "FREE_PRODUCT" | "PAID" | "COMMISSION" | "GIFTING",
  "suggestedCategory": "Beauty" | "Fashion" | "Tech" | "Health & Wellness" | "Home" | "Fitness" | "General"
}`

  // Attempt Tier 1: Gemini 2.5 Flash Free Tier
  if (geminiApiKey) {
    try {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        }
      )

      if (geminiRes.ok) {
        const geminiJson = await geminiRes.json()
        const text = geminiJson.candidates?.[0]?.content?.parts?.[0]?.text
        if (text) {
          const parsed = JSON.parse(text)
          return {
            title: parsed.title || ogData.title,
            brandName: parsed.brandName || ogData.brandName,
            description: parsed.description || ogData.description,
            imageUrl: ogData.imageUrl,
            compensationType: parsed.compensationType || 'FREE_PRODUCT',
            suggestedCategory: parsed.suggestedCategory || 'General',
            source: 'ai_gemini',
          }
        }
      }
    } catch (err) {
      console.warn('[smartExtractCampaignMetadata] Gemini attempt failed, falling back...', err)
    }
  }

  // Attempt Tier 2: Groq Free Tier (Llama 3.3 70B)
  if (groqApiKey) {
    try {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqApiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
        }),
      })

      if (groqRes.ok) {
        const groqJson = await groqRes.json()
        const text = groqJson.choices?.[0]?.message?.content
        if (text) {
          const parsed = JSON.parse(text)
          return {
            title: parsed.title || ogData.title,
            brandName: parsed.brandName || ogData.brandName,
            description: parsed.description || ogData.description,
            imageUrl: ogData.imageUrl,
            compensationType: parsed.compensationType || 'FREE_PRODUCT',
            suggestedCategory: parsed.suggestedCategory || 'General',
            source: 'ai_groq',
          }
        }
      }
    } catch (err) {
      console.warn('[smartExtractCampaignMetadata] Groq attempt failed, falling back...', err)
    }
  }

  // Tier 3: Return clean OpenGraph metadata
  return ogData
}
