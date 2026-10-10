export const ACCESS_COOKIE_NAME = 'menitap_access'

/**
 * Gets the expected cookie value for a given access code.
 * @param code - The access code to validate
 * @returns Base64-encoded authorization value
 */
export function getAccessCookieValue(code: string): string {
  return Buffer.from(`menitap_authorized_${code}`).toString('base64')
}

/**
 * Validates that SITE_ACCESS_CODE is configured in production.
 * Fails closed: throws if env is production and code is not set.
 */
export function getAccessCode(): string {
  const code = process.env.SITE_ACCESS_CODE
  
  const isProd = process.env.NODE_ENV === 'production'
  if (isProd && !code) {
    throw new Error(
      'SITE_ACCESS_CODE environment variable is required in production. Access gate cannot function without it.'
    )
  }
  
  // In non-production, fail closed: return null sentinel so middleware rejects access
  return code || ''
}
