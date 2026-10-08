/**
 * Helper utilities for creator campaign actions (emails, URLs, Gmail compose)
 */

export function extractEmailAddress(sender: string | null | undefined): string | null {
  if (!sender) return null
  const match = sender.match(/<([^>]+)>/) || sender.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)
  return match ? match[1].trim() : null
}

function isJunkUrl(url: string): boolean {
  const lower = url.toLowerCase()
  return (
    lower.includes('unsubscribe') ||
    lower.includes('mail-settings.google.com') ||
    lower.includes('mail.google.com') ||
    lower.includes('schema.org') ||
    lower.includes('w3.org') ||
    lower.includes('list-manage') ||
    lower.includes('email-tracking') ||
    lower.includes('doubleclick') ||
    lower.includes('google.com/s2/favicons')
  )
}

/**
 * Specifically finds application form URLs (Google Forms, Typeform, Airtable, Notion, etc.)
 * or any URL following words like "form", "apply", "application"
 */
export function extractApplicationFormUrl(text: string | null | undefined): string | null {
  if (!text) return null

  // 1. Look for known form hosts
  const formHostMatch = text.match(
    /https?:\/\/(?:forms\.gle|docs\.google\.com\/forms|[\w.-]*typeform\.com|airtable\.com\/(?:app|shr)[\w]+|tally\.so|jotform\.com|[\w.-]*notion\.site|surveymonkey\.com)[\w\d\-._~:/?#[\]@!$&'()*+,;=]*/i
  )
  if (formHostMatch && !isJunkUrl(formHostMatch[0])) {
    return formHostMatch[0]
  }

  // 2. HTML anchor tag with apply/form keywords
  const htmlAnchorMatch = text.match(
    /<a\s+[^>]*href=["'](https?:\/\/[^"'>]+)["'][^>]*>[\s\S]{0,120}?(?:apply|application|form|survey|sign\s*up|register)[\s\S]{0,50}?<\/a>/i
  )
  if (htmlAnchorMatch && htmlAnchorMatch[1] && !isJunkUrl(htmlAnchorMatch[1])) {
    return htmlAnchorMatch[1]
  }

  // 3. Look for URL following "application", "apply", "form"
  const nearContextMatch = text.match(
    /(?:application|apply|form|link|register)[\s\S]{0,120}?(https?:\/\/[^\s<>"')]+)/i
  )
  if (nearContextMatch && nearContextMatch[1] && !isJunkUrl(nearContextMatch[1])) {
    return nearContextMatch[1]
  }

  // 4. Fallback to first non-junk URL in text
  const allUrls = text.matchAll(/https?:\/\/[^\s<>"')]+/g)
  for (const match of allUrls) {
    if (!isJunkUrl(match[0])) {
      return match[0]
    }
  }

  return null
}

export function getGmailThreadUrl(params: {
  sourceMessageId?: string | null
  fromEmail?: string | null
  subject?: string | null
  brandName?: string | null
}): string {
  const trimmedId = params.sourceMessageId?.trim()

  // 1. If we have a valid Gmail thread or message hex ID (e.g. '1a116ee8b813d3aa')
  if (trimmedId && /^[a-f0-9]+$/i.test(trimmedId)) {
    return `https://mail.google.com/mail/#all/${trimmedId}`
  }

  // 2. If it's an RFC822 Message-ID (e.g. '<xyz@mail.gmail.com>')
  if (trimmedId && (trimmedId.includes('@') || trimmedId.startsWith('<'))) {
    const cleanRfcId = trimmedId.replace(/[<>]/g, '').trim()
    return `https://mail.google.com/mail/#search/${encodeURIComponent(`rfc822msgid:${cleanRfcId}`)}`
  }

  // 3. Fallback: Search for the email directly in Gmail by sender and subject
  const queryParts: string[] = []
  if (params.fromEmail) {
    queryParts.push(`from:${params.fromEmail}`)
  }
  if (params.subject) {
    const cleanSubj = params.subject.replace(/^(re|fwd):\s*/i, '').trim()
    if (cleanSubj) {
      queryParts.push(`"${cleanSubj}"`)
    }
  } else if (params.brandName) {
    queryParts.push(`"${params.brandName}"`)
  }

  const query = queryParts.length > 0 ? queryParts.join(' ') : 'in:inbox'
  return `https://mail.google.com/mail/#search/${encodeURIComponent(query)}`
}

export function getGmailComposeUrl(params: {
  toEmail: string
  subject: string
  body?: string
}): string {
  const su = params.subject.startsWith('Re:') ? params.subject : `Re: ${params.subject}`
  const base = 'https://mail.google.com/mail/?view=cm'
  const to = `&to=${encodeURIComponent(params.toEmail)}`
  const subjectParam = `&su=${encodeURIComponent(su)}`
  const bodyParam = params.body ? `&body=${encodeURIComponent(params.body)}` : ''
  return `${base}${to}${subjectParam}${bodyParam}`
}

export function formatTimeAgo(dateString?: string | null): string {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    const now = new Date()
    const diffInSeconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000))

    if (diffInSeconds < 60) return 'Just now'
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

export function formatExactDateTime(dateString?: string | null): string {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

