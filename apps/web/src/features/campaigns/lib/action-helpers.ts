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

export function extractFirstUrl(text: string | null | undefined): string | null {
  if (!text) return null
  const urlMatch = text.match(/https?:\/\/[^\s<>"')]+/)
  return urlMatch ? urlMatch[0] : null
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
