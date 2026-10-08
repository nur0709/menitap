import { createClient } from '@/lib/supabase/server'
import { matchCategory } from '@/lib/category-matcher'

export interface JoinBrandsScraperResult {
  scanned: number
  ingestedCount: number
  skippedCount: number
  message?: string
  errors: string[]
}

/**
 * Normalizes application URLs to prevent duplicates
 */
function cleanUrl(url?: string | null): string | null {
  if (!url) return null
  try {
    const parsed = new URL(url.trim())
    parsed.searchParams.delete('ref')
    parsed.searchParams.delete('utm_source')
    return parsed.toString().replace(/\/$/, '')
  } catch {
    return url.trim().replace(/\/$/, '')
  }
}

/**
 * Extracts and syncs active product collaboration briefs from JoinBrands.
 * Requires JOINBRANDS_SESSION_COOKIE or JOINBRANDS_AUTH_TOKEN in environment.
 */
export async function syncJoinBrandsCollabs(): Promise<JoinBrandsScraperResult> {
  const sessionCookie = process.env.JOINBRANDS_SESSION_COOKIE
  const authToken = process.env.JOINBRANDS_AUTH_TOKEN

  if (!sessionCookie && !authToken) {
    return {
      scanned: 0,
      ingestedCount: 0,
      skippedCount: 0,
      message: 'JOINBRANDS_SESSION_COOKIE or JOINBRANDS_AUTH_TOKEN not configured.',
      errors: [],
    }
  }

  try {
    const headers: Record<string, string> = {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'application/json, text/plain, */*',
    }

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`
    }
    if (sessionCookie) {
      headers['Cookie'] = sessionCookie
    }

    // JoinBrands jobs / campaigns endpoint
    const res = await fetch('https://joinbrands.com/api/v1/jobs?status=active&limit=30', {
      headers,
      signal: AbortSignal.timeout(15000),
    })

    if (!res.ok) {
      return {
        scanned: 0,
        ingestedCount: 0,
        skippedCount: 0,
        errors: [`JoinBrands API returned status ${res.status}: ${res.statusText}`],
      }
    }

    const json = await res.json()
    const jobs = Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : []

    if (jobs.length === 0) {
      return {
        scanned: 0,
        ingestedCount: 0,
        skippedCount: 0,
        message: 'No active campaigns returned from JoinBrands.',
        errors: [],
      }
    }

    const supabase = await createClient()

    // Fetch active categories for CREATORS
    const { data: creatorCategories } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('type', 'CREATORS')
      .eq('is_active', true)

    const defaultCategory = 7 // TikTok UGC

    // Fetch existing URLs to avoid duplicate inserts
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
    const { data: existingLinks } = await supabase
      .from('brand_links')
      .select('application_url')
      .gt('created_at', sixtyDaysAgo)

    const existingUrls = new Set(
      (existingLinks || []).map((l) => cleanUrl(l.application_url)).filter(Boolean)
    )

    let ingestedCount = 0
    let skippedCount = 0
    const errors: string[] = []

    for (const job of jobs) {
      const jobId = job.id || job._id
      const jobUrl = cleanUrl(`https://joinbrands.com/jobs/${jobId}`)
      if (!jobUrl || existingUrls.has(jobUrl)) {
        skippedCount++
        continue
      }

      const brand = job.brand_name || job.company_name || 'Verified DTC Brand'
      const product = job.product_name || job.title || 'Product Collaboration'
      const description = job.description || job.brief || `Create UGC content for ${product}.`
      const compensation = job.payout
        ? `Free Product + $${job.payout}`
        : 'Free Product'
      const deliverables = job.content_type
        ? `1x ${job.content_type}`
        : '1x UGC Video'
      const imageUrl = job.product_image || job.image_url || null

      let categoryId = defaultCategory
      if (creatorCategories && creatorCategories.length > 0) {
        const matched = matchCategory(`${brand} ${product} ${description}`, creatorCategories)
        if (matched) categoryId = matched.id
      }

      const expiresAt = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()

      const { error: insertErr } = await supabase.from('brand_links').insert({
        brand_name: brand,
        product_name: product,
        application_url: jobUrl,
        category_id: categoryId,
        products_provided: true,
        compensation_details: compensation,
        deliverables,
        description,
        image_url: imageUrl,
        collab_type: 'CASTING_BRIEF',
        source_platform: 'JOINBRANDS',
        source_url: jobUrl,
        status: 'ACTIVE',
        is_verified: true,
        expires_at: expiresAt,
      })

      if (insertErr) {
        errors.push(`${product}: ${insertErr.message}`)
      } else {
        ingestedCount++
        existingUrls.add(jobUrl)
      }
    }

    return {
      scanned: jobs.length,
      ingestedCount,
      skippedCount,
      errors,
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return {
      scanned: 0,
      ingestedCount: 0,
      skippedCount: 0,
      errors: [message],
    }
  }
}
