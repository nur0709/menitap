'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  ACCESS_COOKIE_NAME,
  DEFAULT_ACCESS_CODE,
  getAccessCookieValue,
} from '@/lib/access-gate'

export type AccessGateState = {
  error?: string
}

export async function verifyAccessCode(
  prevState: AccessGateState | null,
  formData: FormData
): Promise<AccessGateState> {
  const code = (formData.get('code') as string)?.trim()
  const returnTo = (formData.get('returnTo') as string)?.trim() || '/'
  const expectedCode = process.env.SITE_ACCESS_CODE || DEFAULT_ACCESS_CODE

  if (!code) {
    return { error: 'Please enter the access code.' }
  }

  if (code !== expectedCode) {
    return { error: 'Invalid access code. Please check and try again.' }
  }

  const cookieStore = await cookies()
  const cookieValue = getAccessCookieValue(expectedCode)

  cookieStore.set(ACCESS_COOKIE_NAME, cookieValue, {
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  // Sanitize returnTo to prevent open redirects
  const destination = returnTo.startsWith('/') && !returnTo.startsWith('//') ? returnTo : '/'
  redirect(destination)
}
