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
async function extractOpenGraphMetadata(targetUrl: string): Promise<ParsedLinkMetadata> {
  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(6000),
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch page: HTTP ${res.status}`)
    }

    const html = await res.text()
    const $ = cheerio.load(html)

    const ogTitle = $('meta[property="og:title"]').attr('content') || $('title').text() || ''
    const ogDesc = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || ''
    const ogSiteName = $('meta[property="og:site_name"]').attr('content') || ''
    const rawImage = $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content') || ''
    let ogImage = ''
    if (rawImage) {
      try {
        ogImage = new URL(rawImage, targetUrl).toString()
      } catch {
        ogImage = ''
      }
    }

    const iconHref = $('link[rel="apple-touch-icon"]').attr('href') || $('link[rel*="icon"]').attr('href') || ''
    let logoUrl = ''
    if (iconHref) {
      try {
        logoUrl = new URL(iconHref, targetUrl).toString()
      } catch {
        logoUrl = ''
      }
    }

    // Advanced image fallback: if og:image is missing, check image_src, JSON-LD, or page imgs
    if (!ogImage) {
      const imgRel = $('link[rel="image_src"]').attr('href')
      if (imgRel) {
        try {
          ogImage = new URL(imgRel, targetUrl).toString()
        } catch {}
      }
    }

    if (!ogImage) {
      // Check JSON-LD schema
      $('script[type="application/ld+json"]').each((_, el) => {
        if (ogImage) return
        try {
          const json = JSON.parse($(el).html() || '{}')
          const img = json.image || json.logo || (Array.isArray(json.image) ? json.image[0] : null)
          if (typeof img === 'string' && img) {
            ogImage = new URL(img, targetUrl).toString()
          } else if (img && typeof img === 'object' && img.url) {
            ogImage = new URL(img.url, targetUrl).toString()
          }
        } catch {}
      })
    }

    if (!ogImage) {
      // Check first prominent content <img> tag (avoiding pixels and analytics)
      $('img').each((_, el) => {
        if (ogImage) return
        const src = $(el).attr('src') || $(el).attr('data-src') || ''
        if (
          src &&
          !src.startsWith('data:') &&
          !src.includes('pixel') &&
          !src.includes('analytics') &&
          !src.includes('tracker') &&
          !src.includes('1x1') &&
          !src.includes('spacer')
        ) {
          try {
            ogImage = new URL(src, targetUrl).toString()
          } catch {}
        }
      })
    }

    // Final image fallback: if still no image, use the logo
    if (!ogImage && logoUrl) {
      ogImage = logoUrl
    }

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
      logoUrl: logoUrl.trim() || ogImage.trim(),
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
    console.log('[smartExtractCampaignMetadata] No AI keys found in environment. Using OpenGraph metadata.')
    return ogData
  }

  const prompt = `You are an expert commerce & UGC content analyst for Menitap, an influencer marketplace.
Analyze this URL, page title, and content:
URL: ${targetUrl}
Page Title: ${ogData.title || 'N/A'}
Page Description: ${ogData.description || 'N/A'}
Site Name: ${ogData.brandName || 'N/A'}

Supported Menitap Categories (CHOOSE THE CLOSEST MATCH FROM THIS LIST):
- "Beauty & Skincare"
- "Tech & Electronics"
- "Fashion & Apparel"
- "Home & Kitchen"
- "Travel & Lifestyle"
- "E-commerce Brands"
- "Tech & SaaS"
- "Beauty & Wellness Brands"
- "TikTok UGC"
- "Instagram Reels"
- "YouTube Longform"

Guidelines:
1. "brandName": Clean recognizable brand/company name (e.g. "Beekman 1802", "Gymshark", "Glossier", "Apple", "Nike").
2. "title": Format a clean, attractive title (max 50 chars).
   - If it is a creator affiliate shop or favorites page (e.g. "Bermet E's Beekman 1802 Favorites | Kindness Krew"), format cleanly as "Beekman 1802 – Bermet's Curated Deals".
   - If it is a product page, remove SEO junk, model SKUs, and shipping slogans down to the clean product name (e.g. "Glossier Cloud Paint Blush", "Apple AirPods Pro 2").
   - If it is a brand collab, format as "Gymshark Athlete & Creator Program".
3. "description": Write a punchy 1-2 sentence pitch for creators and shoppers (max 180 chars). Highlight product perks, gifting, or exclusive discounts.
4. "compensationType": "FREE_PRODUCT" | "PAID" | "COMMISSION" | "GIFTING"
5. "suggestedCategory": Pick the single best category name from the list above.

Respond ONLY with valid JSON with these fields:
{
  "brandName": "Brand Name",
  "title": "Clean Title",
  "description": "Engaging pitch or summary",
  "compensationType": "FREE_PRODUCT" | "PAID" | "COMMISSION" | "GIFTING",
  "suggestedCategory": "Category Name"
}`

  // Attempt Tier 1: Gemini Free Tier (Try 2.5 Flash -> 2.0 Flash -> 1.5 Flash)
  if (geminiApiKey) {
    const candidateModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash']
    for (const model of candidateModels) {
      try {
        const geminiRes = await fetch(
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

        if (geminiRes.ok) {
          const geminiJson = await geminiRes.json()
          const text = geminiJson.candidates?.[0]?.content?.parts?.[0]?.text
          if (text) {
            const parsed = JSON.parse(text)
            console.log(`[smartExtractCampaignMetadata] Successfully processed with Gemini (${model})`)
            return {
              title: parsed.title || ogData.title,
              brandName: parsed.brandName || ogData.brandName,
              description: parsed.description || ogData.description,
              imageUrl: ogData.imageUrl,
              logoUrl: ogData.logoUrl,
              compensationType: parsed.compensationType || 'FREE_PRODUCT',
              suggestedCategory: parsed.suggestedCategory || 'General',
              source: 'ai_gemini',
            }
          }
        } else {
          const errText = await geminiRes.text()
          console.warn(`[smartExtractCampaignMetadata] Gemini (${model}) failed HTTP ${geminiRes.status}:`, errText)
        }
      } catch (err) {
        console.warn(`[smartExtractCampaignMetadata] Gemini (${model}) fetch error:`, err)
      }
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
        signal: AbortSignal.timeout(8000),
      })

      if (groqRes.ok) {
        const groqJson = await groqRes.json()
        const text = groqJson.choices?.[0]?.message?.content
        if (text) {
          const parsed = JSON.parse(text)
          console.log('[smartExtractCampaignMetadata] Successfully processed with Groq')
          return {
            title: parsed.title || ogData.title,
            brandName: parsed.brandName || ogData.brandName,
            description: parsed.description || ogData.description,
            imageUrl: ogData.imageUrl,
            logoUrl: ogData.logoUrl,
            compensationType: parsed.compensationType || 'FREE_PRODUCT',
            suggestedCategory: parsed.suggestedCategory || 'General',
            source: 'ai_groq',
          }
        }
      } else {
        const errText = await groqRes.text()
        console.warn(`[smartExtractCampaignMetadata] Groq failed HTTP ${groqRes.status}:`, errText)
      }
    } catch (err) {
      console.warn('[smartExtractCampaignMetadata] Groq error:', err)
    }
  }

  // Tier 3: Return clean OpenGraph metadata
  return ogData
}
