/**
 * Helper utilities for creator campaign actions (emails, URLs, Gmail compose)
 */

export function extractEmailAddress(sender: string | null | undefined): string | null {
  if (!sender) return null
  const match = sender.match(/<([^>]+)>/) || sender.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)
  return match ? match[1].trim() : null
}

export function extractBrandDomain(senderEmail: string | null, brandName: string): string | null {
  if (senderEmail) {
    const domainMatch = senderEmail.match(/@([a-zA-Z0-9.-]+)/)
    if (domainMatch && domainMatch[1]) {
      const domain = domainMatch[1].toLowerCase()
      // Exclude generic providers
      if (!['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'].includes(domain)) {
        return domain
      }
    }
  }

  // Fallback: slugify brand name
  if (brandName) {
    const clean = brandName.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (clean) return `${clean}.com`
  }

  return null
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

export function extractFirstUrl(text: string | null | undefined): string | null {
  return extractApplicationFormUrl(text)
}

export function getGmailComposeUrl(params: {
  toEmail: string
  subject: string
  body?: string
}): string {
  const su = params.subject.startsWith('Re:') ? params.subject : `Re: ${params.subject}`
  const base = 'https://mail.google.com/mail/?view=cm&fs=1'
  const to = `&to=${encodeURIComponent(params.toEmail)}`
  const subjectParam = `&su=${encodeURIComponent(su)}`
  const bodyParam = params.body ? `&body=${encodeURIComponent(params.body)}` : ''
  return `${base}${to}${subjectParam}${bodyParam}`
}
