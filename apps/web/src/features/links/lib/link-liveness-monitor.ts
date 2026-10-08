import { createClient } from '@/lib/supabase/server'

export interface CleanupResult {
  checkedCount: number
  expiredCount: number
  archivedIds: number[]
  purgedCount: number
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
 * Scans active brand_links, archives expired deadlines, checks form liveness,
 * and permanently purges dead/expired listings older than 30 days to keep the database lean.
 */
export async function cleanupExpiredCollabs(retentionDays = 30): Promise<CleanupResult> {
  const supabase = await createClient()
  const nowIso = new Date().toISOString()
  const purgeCutoffIso = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString()

  // 1. Fetch campaigns that are ACTIVE and have expired by date
  const { data: dateExpired } = await supabase
    .from('brand_links')
    .select('id, expires_at, deadline')
    .eq('status', 'ACTIVE')
    .or(`expires_at.lt.${nowIso},deadline.lt.${nowIso}`)

  const archivedIds: number[] = []

  if (dateExpired && dateExpired.length > 0) {
    const ids = dateExpired.map((d) => d.id)
    await supabase
      .from('brand_links')
      .update({ status: 'EXPIRED', updated_at: nowIso })
      .in('id', ids)
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
        await supabase
          .from('brand_links')
          .update({ status: 'EXPIRED', updated_at: nowIso })
          .eq('id', link.id)
        archivedIds.push(link.id)
        expiredCount++
      }
    }
  }

  // 3. AUTO-PURGE: Permanently hard-delete dead links (EXPIRED or REJECTED) older than retention period (30 days)
  // This ensures the database never accumulates trash over time.
  const { data: purgedRecords } = await supabase
    .from('brand_links')
    .delete()
    .in('status', ['EXPIRED', 'REJECTED'])
    .or(`updated_at.lt.${purgeCutoffIso},created_at.lt.${purgeCutoffIso}`)
    .select('id')

  const purgedCount = purgedRecords?.length || 0

  return {
    checkedCount,
    expiredCount,
    archivedIds,
    purgedCount,
  }
}
