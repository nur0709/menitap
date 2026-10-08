import { createClient } from '@/lib/supabase/server'

export interface CleanupResult {
  checkedCount: number
  expiredCount: number
  archivedIds: number[]
}

/**
 * Checks if a given application form URL is still live and accepting responses.
 */
async function checkFormUrlLiveness(url: string): Promise<boolean> {
  if (!url || !url.startsWith('http')) return false

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(5000),
    })

    if (res.status === 404 || res.status === 410) {
      return false
    }

    if (!res.ok) {
      // 403 or other codes might be Cloudflare challenge, so don't prematurely expire
      return true
    }

    // Inspect the first 10KB of HTML for known closed form indicators
    const textChunk = (await res.text()).slice(0, 10000).toLowerCase()

    const closedIndicators = [
      'no longer accepting responses',
      'this form is closed',
      'form has been closed',
      'is no longer active',
      'application is closed',
      'submissions are closed',
    ]

    const isClosed = closedIndicators.some((indicator) => textChunk.includes(indicator))
    return !isClosed
  } catch {
    // In case of timeout or network glitch, assume live to prevent false positives
    return true
  }
}

/**
 * Scans active brand_links, archives expired deadlines, and checks form liveness.
 */
export async function cleanupExpiredCollabs(): Promise<CleanupResult> {
  const supabase = await createClient()
  const nowIso = new Date().toISOString()

  // 1. Fetch campaigns that are ACTIVE and have expired by date
  const { data: dateExpired } = await supabase
    .from('brand_links')
    .select('id, expires_at, deadline')
    .eq('status', 'ACTIVE')
    .or(`expires_at.lt.${nowIso},deadline.lt.${nowIso}`)

  const archivedIds: number[] = []

  if (dateExpired && dateExpired.length > 0) {
    const ids = dateExpired.map((d) => d.id)
    await supabase.from('brand_links').update({ status: 'EXPIRED' }).in('id', ids)
    archivedIds.push(...ids)
  }

  // 2. Check a batch of active links for dead URLs or closed forms
  const { data: activeLinks } = await supabase
    .from('brand_links')
    .select('id, application_url')
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: true })
    .limit(20)

  let checkedCount = 0
  let expiredCount = archivedIds.length

  if (activeLinks) {
    for (const link of activeLinks) {
      checkedCount++
      const isLive = await checkFormUrlLiveness(link.application_url)
      if (!isLive) {
        await supabase.from('brand_links').update({ status: 'EXPIRED' }).eq('id', link.id)
        archivedIds.push(link.id)
        expiredCount++
      }
    }
  }

  return {
    checkedCount,
    expiredCount,
    archivedIds,
  }
}
