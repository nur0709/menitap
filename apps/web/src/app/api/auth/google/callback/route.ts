import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { exchangeGoogleCode, fetchGoogleUserEmail } from '@/features/integrations/google/oauth'
import { syncUserGmailCampaigns } from '@/features/integrations/google/gmail-sync'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${url.protocol}//${url.host}`
  const code = url.searchParams.get('code')
  const stateUserId = url.searchParams.get('state')
  const errorParam = url.searchParams.get('error')

  if (errorParam) {
    console.warn('[google/callback] OAuth error param:', errorParam)
    return NextResponse.redirect(
      `${appUrl}/dashboard?error=${encodeURIComponent(`Google access was denied (${errorParam})`)}`
    )
  }

  if (!code || !stateUserId) {
    return NextResponse.redirect(
      `${appUrl}/dashboard?error=${encodeURIComponent('Missing authorization code or user session')}`
    )
  }

  try {
    const tokens = await exchangeGoogleCode(code)
    const googleEmail = await fetchGoogleUserEmail(tokens.access_token)

    const supabase = await createClient()

    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

    let refreshToken = tokens.refresh_token
    if (!refreshToken) {
      const { data: existing } = await supabase
        .from('user_email_integrations')
        .select('refresh_token')
        .eq('user_id', stateUserId)
        .eq('provider', 'google')
        .single()
      refreshToken = existing?.refresh_token || ''
    }

    // Upsert into user_email_integrations
    const { error: dbError } = await supabase.from('user_email_integrations').upsert(
      {
        user_id: stateUserId,
        provider: 'google',
        email_address: googleEmail,
        refresh_token: refreshToken,
        access_token: tokens.access_token,
        token_expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,provider' }
    )

    if (dbError) {
      console.error('[google/callback] DB error saving integration:', dbError)
      return NextResponse.redirect(
        `${appUrl}/dashboard?error=${encodeURIComponent('Failed to save Google account integration')}`
      )
    }

    // Trigger initial background sync
    try {
      await syncUserGmailCampaigns(stateUserId)
    } catch (syncErr) {
      console.warn('[google/callback] Initial sync warning:', syncErr)
    }

    return NextResponse.redirect(`${appUrl}/dashboard?google=connected`)
  } catch (err) {
    console.error('[google/callback] Exception in callback:', err)
    const msg = err instanceof Error ? err.message : 'Unknown error during Google authentication'
    return NextResponse.redirect(`${appUrl}/dashboard?error=${encodeURIComponent(msg)}`)
  }
}
