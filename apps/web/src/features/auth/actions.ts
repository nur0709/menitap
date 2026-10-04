'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

import { headers } from 'next/headers'

const AuthSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['USER', 'CREATOR', 'BRAND']).optional(),
})

export type AuthState = {
  error?: string
  success?: string
}

export async function signInWithEmail(prevState: AuthState | null, formData: FormData): Promise<AuthState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const validation = AuthSchema.safeParse({ email, password })
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || 'Invalid input' }
  }

  const supabase = await createClient()

  // Verify whether the account exists
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: userExists } = await (supabase as any).rpc('check_user_exists', { p_email: email })
  if (userExists === false) {
    return {
      error: 'Account not found. Please sign up first to create an account.',
    }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signUpWithEmail(prevState: AuthState | null, formData: FormData): Promise<AuthState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const rawRole = (formData.get('role') as string) || 'USER'
  const role = ['USER', 'CREATOR', 'BRAND'].includes(rawRole) ? rawRole : 'USER'

  const validation = AuthSchema.safeParse({ email, password, role })
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || 'Invalid input' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || '',
        role,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return {
    success: 'Account created! Please check your email to confirm your account before logging in.',
  }
}

export async function signInWithGoogle(formData?: FormData) {
  const supabase = await createClient()
  const requestedRole = formData ? (formData.get('role') as string) : null
  
  let origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  try {
    const headersList = await headers()
    const host = headersList.get('x-forwarded-host') || headersList.get('host')
    const proto = headersList.get('x-forwarded-proto') || 'https'
    if (host) {
      origin = `${proto}://${host}`
    }
  } catch {
    // fallback to env var
  }

  const callbackUrl = new URL(`${origin}/auth/callback`)
  if (requestedRole && ['USER', 'CREATOR', 'BRAND'].includes(requestedRole)) {
    callbackUrl.searchParams.set('role', requestedRole)
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: callbackUrl.toString(),
    },
  })

  if (error) {
    redirect(`/sign-in?error=${encodeURIComponent(error.message)}`)
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}
