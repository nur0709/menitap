import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getGoogleAuthUrl } from '@/features/integrations/google/oauth'

export async function GET(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = new URL(req.url)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${url.protocol}//${url.host}`

  if (!user) {
    return NextResponse.redirect(`${appUrl}/sign-in?redirect=/dashboard`)
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) {
    return NextResponse.redirect(
      `${appUrl}/dashboard?error=${encodeURIComponent(
        'Google OAuth Client ID is not configured yet. Please configure GOOGLE_CLIENT_ID.'
      )}`
    )
  }

  const authUrl = getGoogleAuthUrl(user.id)
  return NextResponse.redirect(authUrl)
}
