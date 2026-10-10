'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  ACCESS_COOKIE_NAME,
  getAccessCookieValue,
  getAccessCode,
} from '@/lib/access-gate'

export type AccessGateState = {
  error?: string
}

/**
 * Validates the access code and sets the authorization cookie.
 * Sanitizes returnTo to prevent open redirects.
 */
export async function verifyAccessCode(
  prevState: AccessGateState | null,
  formData: FormData
): Promise<AccessGateState> {
  const code = (formData.get('code') as string)?.trim()
  const returnTo = (formData.get('returnTo') as string)?.trim() || '/'

  let expectedCode: string
  try {
    expectedCode = getAccessCode()
  } catch {
    return { error: 'Access gate is not properly configured. Please contact the administrator.' }
  }

  if (!code) {
    return { error: 'Please enter the access code.' }
  }

  if (!expectedCode) {
    return { error: 'Access gate is not available. Please contact the administrator.' }
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
  // Only allow relative paths that start with /
  const destination = returnTo.startsWith('/') && !returnTo.startsWith('//')
    ? returnTo
    : '/'

  redirect(destination)
}
