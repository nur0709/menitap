import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Allowed redirect destinations after OAuth callback.
 * Prevents open redirect attacks by restricting to known internal paths.
 */
const ALLOWED_REDIRECT_PATHS = ['/', '/dashboard', '/sign-in', '/access-gate']

/**
 * Validates that a redirect destination is safe (internal and allowed).
 * @param destination - The path to validate
 * @returns true if safe, false otherwise
 */
function isSafeRedirectDestination(destination: string): boolean {
  // Must start with / and not be a protocol-relative URL (//)
  if (!destination.startsWith('/') || destination.startsWith('//')) {
    return false
  }
  
  // Check against allowed list, or allow any path under /dashboard for flexibility
  return (
    ALLOWED_REDIRECT_PATHS.includes(destination) ||
    destination.startsWith('/dashboard/')
  )
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      const roleParam = searchParams.get('role')
      
      if (roleParam && ['USER', 'CREATOR'].includes(roleParam)) {
        // If user already has a specific role set in profiles, don't overwrite it unless they are still default USER
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle()

        if (!existingProfile || existingProfile.role === 'USER' || existingProfile.role === 'DELETED') {
          await supabase
            .from('profiles')
            .update({ role: roleParam, updated_at: new Date().toISOString() })
            .eq('id', data.user.id)
          
          await supabase.auth.updateUser({
            data: { role: roleParam },
          })
        }
      } else if (!roleParam) {
        // If no roleParam specified (standard sign-in), but profile was previously DELETED, reactivate as USER
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle()

        if (existingProfile && existingProfile.role === 'DELETED') {
          await supabase
            .from('profiles')
            .update({ role: 'USER', updated_at: new Date().toISOString() })
            .eq('id', data.user.id)
          
          await supabase.auth.updateUser({
            data: { role: 'USER' },
          })
        }
      }

      // Validate redirect destination to prevent open redirects
      if (!isSafeRedirectDestination(next)) {
        return NextResponse.redirect(`${origin}/dashboard`)
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
