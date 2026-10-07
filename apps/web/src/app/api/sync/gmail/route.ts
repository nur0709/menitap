import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { syncUserGmailCampaigns } from '@/features/integrations/google/gmail-sync'

export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await syncUserGmailCampaigns(user.id)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[api/sync/gmail] Error during sync:', err)
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Sync failed' },
      { status: 500 }
    )
  }
}
