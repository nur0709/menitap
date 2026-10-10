import { NextRequest, NextResponse } from 'next/server'
import { syncCommunityCollabs } from '@/features/links/lib/community-scraper'
import { syncJoinBrandsCollabs } from '@/features/links/lib/joinbrands-scraper'
import { cleanupExpiredCollabs } from '@/features/links/lib/link-liveness-monitor'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  // Allow secret token authentication for cron jobs or Vercel cron
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  const isDev = process.env.NODE_ENV === 'development'
  const authorized = Boolean(cronSecret) && authHeader === `Bearer ${cronSecret}`
  if (!isDev && !authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (isDev && cronSecret && !authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action') || 'all'

  try {
    let syncResult = null
    let joinBrandsResult = null
    let cleanupResult = null

    if (action === 'sync' || action === 'all') {
      syncResult = await syncCommunityCollabs()
      joinBrandsResult = await syncJoinBrandsCollabs()
    }

    if (action === 'cleanup' || action === 'all') {
      cleanupResult = await cleanupExpiredCollabs()
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      sync: syncResult,
      joinBrands: joinBrandsResult,
      cleanup: cleanupResult,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  return GET(req)
}
