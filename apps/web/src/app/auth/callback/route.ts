import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const roleParam = searchParams.get('role')
      if (roleParam && ['USER', 'CREATOR', 'BRAND'].includes(roleParam) && data.user) {
        // If user already has a specific role set in profiles, don't overwrite it unless they are still default USER
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()

        if (!existingProfile || existingProfile.role === 'USER') {
          await supabase.from('profiles').update({ role: roleParam }).eq('id', data.user.id)
          await supabase.auth.updateUser({
            data: { role: roleParam },
          })
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/sign-in?error=auth_callback_failed`)
}
