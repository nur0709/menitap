export const ACCESS_COOKIE_NAME = 'menitap_access'
export const DEFAULT_ACCESS_CODE = 'menitap2026'

export function getAccessCookieValue(code: string): string {
  return Buffer.from(`menitap_authorized_${code}`).toString('base64')
}
