import { NextRequest, NextResponse } from 'next/server'
import { syncCommunityCollabs } from '@/features/links/lib/community-scraper'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  // Allow secret token authentication for cron jobs or Vercel cron
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Check if development or authorized
    const isDev = process.env.NODE_ENV === 'development'
    if (!isDev) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const result = await syncCommunityCollabs()
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  return GET(req)
}
