import { createClient } from '@/lib/supabase/server'

export function getGoogleOAuthRedirectUri(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://menitap.com'
  return `${appUrl.replace(/\/$/, '')}/api/auth/google/callback`
}

export function getGoogleAuthUrl(userId: string, intent: 'gmail' | 'youtube' = 'gmail'): string {
  const clientId = process.env.GOOGLE_CLIENT_ID || ''
  const redirectUri = getGoogleOAuthRedirectUri()

  const scopes =
    intent === 'youtube'
      ? [
          'https://www.googleapis.com/auth/youtube.readonly',
          'https://www.googleapis.com/auth/userinfo.email',
        ]
      : [
          'https://www.googleapis.com/auth/gmail.readonly',
          'https://www.googleapis.com/auth/userinfo.email',
        ]

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state: intent === 'youtube' ? `${userId}:youtube` : userId,
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export interface GoogleTokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  token_type: string
  scope: string
}

export async function exchangeGoogleCode(code: string): Promise<GoogleTokenResponse> {
  const clientId = process.env.GOOGLE_CLIENT_ID || ''
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || ''
  const redirectUri = getGoogleOAuthRedirectUri()

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`Failed to exchange Google OAuth code (${res.status}): ${errorText}`)
  }

  return (await res.json()) as GoogleTokenResponse
}

export async function fetchGoogleUserEmail(accessToken: string): Promise<string> {
  const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) {
    throw new Error('Failed to fetch Google user profile')
  }

  const data = await res.json()
  return data.email as string
}

export async function refreshGoogleAccessToken(refreshToken: string): Promise<{
  access_token: string
  expires_in: number
}> {
  const clientId = process.env.GOOGLE_CLIENT_ID || ''
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || ''

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`Failed to refresh Google access token: ${errorText}`)
  }

  const data = await res.json()
  return {
    access_token: data.access_token as string,
    expires_in: data.expires_in as number,
  }
}

export async function getValidGoogleAccessToken(userId: string): Promise<string | null> {
  const supabase = await createClient()

  const { data: integration, error } = await supabase
    .from('user_email_integrations')
    .select('refresh_token, access_token, token_expires_at')
    .eq('user_id', userId)
    .eq('provider', 'google')
    .single()

  if (error || !integration) {
    return null
  }

  const now = new Date()
  const expiresAt = integration.token_expires_at ? new Date(integration.token_expires_at) : null

  // If token is still valid for at least 5 minutes, return it
  if (integration.access_token && expiresAt && expiresAt.getTime() - now.getTime() > 5 * 60 * 1000) {
    return integration.access_token
  }

  // Otherwise, refresh it using refresh_token
  try {
    const refreshed = await refreshGoogleAccessToken(integration.refresh_token)
    const newExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString()

    await supabase
      .from('user_email_integrations')
      .update({
        access_token: refreshed.access_token,
        token_expires_at: newExpiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('provider', 'google')

    return refreshed.access_token
  } catch (err) {
    console.error('[getValidGoogleAccessToken] Refresh failed:', err)
    return null
  }
}
