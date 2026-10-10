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

const FORM_HOST =
  /https?:\/\/(?:forms\.gle|docs\.google\.com\/forms|[\w.-]*typeform\.com|airtable\.com\/(?:app|shr)[\w]+|tally\.so|jotform\.com|[\w.-]*notion\.site|surveymonkey\.com)[^\s<>"')\]]*/i

function cleanFoundUrl(url: string): string {
  return url.replace(/&amp;/g, '&').replace(/[>),.\]]+$/, '')
}

/**
 * A form or apply link only. Does not fall back to the first URL in the mail.
 */
export function extractApplyLink(text: string | null | undefined): string | null {
  if (!text) return null

  const formHostMatch = text.match(FORM_HOST)
  if (formHostMatch && !isJunkUrl(formHostMatch[0])) {
    return cleanFoundUrl(formHostMatch[0])
  }

  const htmlAnchorMatch = text.match(
    /<a\s+[^>]*href=["'](https?:\/\/[^"'>]+)["'][^>]*>[\s\S]{0,120}?(?:apply|application|form|survey|sign\s*up|register)[\s\S]{0,50}?<\/a>/i
  )
  if (htmlAnchorMatch?.[1] && !isJunkUrl(htmlAnchorMatch[1])) {
    return cleanFoundUrl(htmlAnchorMatch[1])
  }

  const labeledLink = text.match(
    /\b(?:application|apply|form|register)\b[^:\n]{0,40}:\s*(https?:\/\/[^\s<>"')\]]+)/i
  )
  if (labeledLink?.[1] && !isJunkUrl(labeledLink[1])) {
    return cleanFoundUrl(labeledLink[1])
  }

  const nearContextMatch = text.match(
    /\b(?:application|apply|form|register)\b[\s\S]{0,120}?(https?:\/\/[^\s<>"')\]]+)/i
  )
  if (nearContextMatch?.[1] && !isJunkUrl(nearContextMatch[1])) {
    return cleanFoundUrl(nearContextMatch[1])
  }

  return null
}

/**
 * Keeps button links that text/plain and tag-stripping would drop.
 * Each kept link is "label: url" so a later pass can tell an apply button from a logo.
 */
export function appendHtmlLinks(text: string, html: string): string {
  const links: { href: string; label: string }[] = []
  const seen = new Set<string>()
  const anchors = html.matchAll(/<a\b[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)
  for (const match of anchors) {
    const href = cleanFoundUrl(match[1] ?? '')
    if (!href.startsWith('https://') || isJunkUrl(href) || seen.has(href)) continue
    if (/\.(png|jpe?g|gif|svg|webp)(\?|$)/i.test(href)) continue
    seen.add(href)
    const label = (match[2] ?? '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 80)
    if (/unsubscribe|view in browser|privacy policy|manage preferences/i.test(label)) continue
    links.push({ href, label })
    if (links.length >= 8) break
  }
  if (links.length === 0) return text.trim()
  const lines = links.map((link) => (link.label ? `- ${link.label}: ${link.href}` : `- ${link.href}`))
  return `${text.trim()}\n\nLinks:\n${lines.join('\n')}`.trim()
}

/**
 * Specifically finds application form URLs (Google Forms, Typeform, Airtable, Notion, etc.)
 * or any URL following words like "form", "apply", "application"
 */
export function extractApplicationFormUrl(text: string | null | undefined): string | null {
  const applyLink = extractApplyLink(text)
  if (applyLink) return applyLink
  if (!text) return null

  const allUrls = text.matchAll(/https?:\/\/[^\s<>"')]+/g)
  for (const match of allUrls) {
    if (!isJunkUrl(match[0])) {
      return cleanFoundUrl(match[0])
    }
  }

  return null
}

function cleanSearchQueryText(text: string): string {
  if (!text) return ''
  return text
    .replace(/^(re|fwd):\s*/i, '')
    // Strip emojis and non-standard unicode characters that break quoted Gmail searches
    .replace(
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu,
      ' '
    )
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function getGmailThreadUrl(params: {
  sourceMessageId?: string | null
  fromEmail?: string | null
  subject?: string | null
  brandName?: string | null
  userEmail?: string | null
}): string {
  const userEmail = params.userEmail?.trim()
  // Use canonical /u/0/ to prevent Google 301 redirect from stripping the URL hash fragment
  const base = userEmail
    ? `https://mail.google.com/mail/u/0/?authuser=${encodeURIComponent(userEmail)}`
    : 'https://mail.google.com/mail/u/0/'

  const trimmedId = params.sourceMessageId?.trim()

  // 1. If we have a valid Gmail thread or message hex ID (e.g. '1a116ee8b813d3aa')
  if (trimmedId && /^[a-f0-9]+$/i.test(trimmedId)) {
    return `${base}#all/${trimmedId}`
  }

  // 2. If it's an RFC822 Message-ID (e.g. '<xyz@mail.gmail.com>')
  if (trimmedId && (trimmedId.includes('@') || trimmedId.startsWith('<'))) {
    const cleanRfcId = trimmedId.replace(/[<>]/g, '').trim()
    return `${base}#search/${encodeURIComponent(`rfc822msgid:${cleanRfcId}`)}`
  }

  // 3. Fallback: Search for the email directly in Gmail by sender domain/email and clean subject
  const queryParts: string[] = []
  if (params.fromEmail) {
    const domain = params.fromEmail.split('@')[1]
    if (
      domain &&
      !['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'].includes(
        domain.toLowerCase()
      )
    ) {
      queryParts.push(`(from:${params.fromEmail} OR ${domain})`)
    } else {
      queryParts.push(`from:${params.fromEmail}`)
    }
  } else if (params.brandName) {
    queryParts.push(`"${params.brandName}"`)
  }

  const cleanSubj = cleanSearchQueryText(params.subject || '')
  if (cleanSubj) {
    queryParts.push(`"${cleanSubj}"`)
  }

  const query = queryParts.length > 0 ? queryParts.join(' ') : 'in:inbox'
  return `${base}#search/${encodeURIComponent(query)}`
}

export function getGmailComposeUrl(params: {
  toEmail: string
  subject: string
  body?: string
  userEmail?: string | null
}): string {
  const su = params.subject.startsWith('Re:') ? params.subject : `Re: ${params.subject}`
  const userParam = params.userEmail?.trim()
    ? `&authuser=${encodeURIComponent(params.userEmail.trim())}`
    : ''
  const base = 'https://mail.google.com/mail/u/0/?view=cm'
  const to = `&to=${encodeURIComponent(params.toEmail)}`
  const subjectParam = `&su=${encodeURIComponent(su)}`
  const bodyParam = params.body ? `&body=${encodeURIComponent(params.body)}` : ''
  return `${base}${userParam}${to}${subjectParam}${bodyParam}`
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

