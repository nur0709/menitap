import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { exchangeGoogleCode, fetchGoogleUserEmail } from '@/features/integrations/google/oauth'
import { syncUserGmailCampaigns } from '@/features/integrations/google/gmail-sync'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${url.protocol}//${url.host}`
  const code = url.searchParams.get('code')
  const rawState = url.searchParams.get('state')
  const errorParam = url.searchParams.get('error')

  let stateUserId = rawState || ''
  let intent: 'gmail' | 'youtube' = 'gmail'
  if (rawState?.includes(':youtube')) {
    stateUserId = rawState.replace(':youtube', '')
    intent = 'youtube'
  }

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
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.id !== stateUserId) {
      return NextResponse.redirect(
        `${appUrl}/dashboard?error=${encodeURIComponent(
          'Start Google connect from your signed-in Menitap account.'
        )}`
      )
    }

    if (intent === 'youtube') {
      try {
        const ytRes = await fetch(
          'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
          {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
          }
        )

        if (ytRes.ok) {
          const ytData = await ytRes.json()
          const item = ytData.items?.[0]
          if (item) {
            const customUrl = item.snippet?.customUrl // e.g. "@creator"
            const channelId = item.id
            const handle = customUrl || channelId
            const youtubeUrl = customUrl
              ? (customUrl.startsWith('@') ? `https://youtube.com/${customUrl}` : `https://youtube.com/@${customUrl}`)
              : `https://youtube.com/channel/${channelId}`

            await supabase
              .from('profiles')
              .update({
                youtube_url: youtubeUrl,
                updated_at: new Date().toISOString(),
              })
              .eq('id', stateUserId)

            return NextResponse.redirect(
              `${appUrl}/dashboard?tab=profile&success=${encodeURIComponent(`YouTube connected: ${handle}`)}`
            )
          }
        } else {
          const errText = await ytRes.text()
          console.warn('[google/callback] YouTube API response not ok:', ytRes.status, errText)
        }
      } catch (ytErr) {
        console.error('[google/callback] Failed to fetch YouTube channel:', ytErr)
      }

      return NextResponse.redirect(
        `${appUrl}/dashboard?tab=profile&error=${encodeURIComponent(
          'Could not auto-detect a YouTube channel on this Google account. Please enter your handle manually!'
        )}`
      )
    }

    const googleEmail = await fetchGoogleUserEmail(tokens.access_token)

    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

    let refreshToken = tokens.refresh_token
    if (!refreshToken) {
      const { data: existing } = await supabase
        .from('user_email_integrations')
        .select('refresh_token')
        .eq('user_id', stateUserId)
        .eq('provider', 'google')
        .maybeSingle()
      refreshToken = existing?.refresh_token || undefined
    }

    if (!refreshToken) {
      return NextResponse.redirect(
        `${appUrl}/dashboard?error=${encodeURIComponent(
          'Google did not return a refresh token. Remove Menitap from your Google account access and connect again.'
        )}`
      )
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
