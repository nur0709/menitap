/** Same-origin path only. Rejects protocol-relative and absolute URLs. */
export function safeNextPath(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const path = value.trim()
  if (path.length === 0 || path.length > 200) return null
  if (!path.startsWith('/')) return null
  if (path.startsWith('//') || path.startsWith('/\\')) return null
  if (path.includes('://') || path.includes('\\')) return null
  return path
}
