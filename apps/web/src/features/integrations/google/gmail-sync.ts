import { createClient } from '@/lib/supabase/server'
import { getValidGoogleAccessToken } from './oauth'
import { parseEmailToCampaignCard } from '@/features/campaigns/lib/email-card-parser'

interface GmailHeader {
  name: string
  value: string
}

interface GmailPart {
  mimeType: string
  body?: {
    data?: string
    size?: number
  }
  parts?: GmailPart[]
}

interface GmailMessageDetail {
  id: string
  threadId: string
  internalDate: string
  payload?: {
    headers: GmailHeader[]
    mimeType: string
    body?: {
      data?: string
    }
    parts?: GmailPart[]
  }
}

/**
 * Recursively decodes email body text from Gmail API payload
 */
function extractBodyFromPayload(payload?: GmailMessageDetail['payload']): string {
  if (!payload) return ''

  // 1. Direct body data
  if (payload.body?.data) {
    return decodeBase64Url(payload.body.data)
  }

  // 2. Search parts
  if (payload.parts && payload.parts.length > 0) {
    // Prefer text/plain
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return decodeBase64Url(part.body.data)
      }
    }

    // Fallback: search sub-parts recursively
    for (const part of payload.parts) {
      if (part.parts) {
        const nested = extractBodyFromPayload({ headers: [], mimeType: part.mimeType, parts: part.parts })
        if (nested) return nested
      }
    }

    // Fallback: text/html stripped
    for (const part of payload.parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        const html = decodeBase64Url(part.body.data)
        return stripHtml(html)
      }
    }
  }

  return ''
}

function decodeBase64Url(str: string): string {
  try {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
    return Buffer.from(base64, 'base64').toString('utf-8')
  } catch {
    return ''
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getHeader(headers: GmailHeader[], name: string): string {
  const h = headers.find((header) => header.name.toLowerCase() === name.toLowerCase())
  return h?.value || ''
}

export interface SyncResult {
  success: boolean
  newDealsCount: number
  totalScanned: number
  error?: string
}

export async function syncUserGmailCampaigns(userId: string): Promise<SyncResult> {
  const accessToken = await getValidGoogleAccessToken(userId)
  if (!accessToken) {
    return { success: false, newDealsCount: 0, totalScanned: 0, error: 'Not connected to Google' }
  }

  const supabase = await createClient()

  // 1. Targeted query for brand collaborations / UGC / pitches
  const query = [
    'collab',
    'collaboration',
    'UGC',
    '"brand deal"',
    '"paid partnership"',
    '"gifted"',
    '"PR package"',
    '"deliverables"',
    'pitch',
    'video',
    'campaign',
  ].join(' OR ')

  const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(
    `(${query})`
  )}&maxResults=25`

  const listRes = await fetch(listUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!listRes.ok) {
    const errorText = await listRes.text()
    console.error('[syncUserGmailCampaigns] Gmail list error:', errorText)
    return { success: false, newDealsCount: 0, totalScanned: 0, error: 'Failed to search Gmail' }
  }

  const listData = (await listRes.json()) as { messages?: { id: string }[] }
  const messageRefs = listData.messages || []

  if (messageRefs.length === 0) {
    await supabase
      .from('user_email_integrations')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('provider', 'google')

    return { success: true, newDealsCount: 0, totalScanned: 0 }
  }

  // 2. Filter out already processed messages (deduplication)
  const messageIds = messageRefs.map((m) => m.id)
  const { data: existingCampaigns } = await supabase
    .from('creator_campaigns')
    .select('source_message_id')
    .eq('user_id', userId)
    .in('source_message_id', messageIds)

  const existingSet = new Set((existingCampaigns || []).map((c) => c.source_message_id))
  const newMessagesToFetch = messageIds.filter((id) => !existingSet.has(id))

  let newDealsCount = 0

  // 3. Process new messages
  for (const messageId of newMessagesToFetch) {
    try {
      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )

      if (!msgRes.ok) continue

      const msg = (await msgRes.json()) as GmailMessageDetail
      const headers = msg.payload?.headers || []
      const from = getHeader(headers, 'From')
      const subject = getHeader(headers, 'Subject')
      const bodyText = extractBodyFromPayload(msg.payload)

      if (!bodyText && !subject) continue

      // 4. Run AI Gatekeeper & Campaign Extractor
      const parsedCard = await parseEmailToCampaignCard({
        text: bodyText || subject,
        sender: from,
        subject,
      })

      // If classified as not a collaboration, skip
      if (!parsedCard) continue

      const deadlineIso = parsedCard.deadline
        ? new Date(parsedCard.deadline).toISOString()
        : null

      const emailDate = msg.internalDate
        ? new Date(parseInt(msg.internalDate)).toISOString()
        : new Date().toISOString()

      // 5. Insert deal card
      const { error: insertError } = await supabase.from('creator_campaigns').insert({
        user_id: userId,
        brand_name: parsedCard.brandName,
        brand_logo_url: parsedCard.brandLogoUrl,
        product_name: parsedCard.productName,
        compensation: parsedCard.compensation,
        deliverables: parsedCard.deliverables,
        deadline: deadlineIso,
        status: 'NEW_PITCH',
        raw_source_text: bodyText,
        source_type: 'EMAIL',
        source_sender: parsedCard.cleanSender,
        source_subject: parsedCard.cleanSubject,
        source_message_id: messageId,
        created_at: emailDate,
      })

      if (!insertError) {
        newDealsCount++
      } else {
        console.error('[syncUserGmailCampaigns] Insert error:', insertError)
      }
    } catch (msgErr) {
      console.warn(`[syncUserGmailCampaigns] Failed to process message ${messageId}:`, msgErr)
    }
  }

  // 6. Update last_synced_at
  await supabase
    .from('user_email_integrations')
    .update({ last_synced_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('provider', 'google')

  return {
    success: true,
    newDealsCount,
    totalScanned: newMessagesToFetch.length,
  }
}
