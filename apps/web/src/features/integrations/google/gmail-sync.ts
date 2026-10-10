import { createClient } from '@/lib/supabase/server'
import { getValidGoogleAccessToken } from './oauth'
import { appendHtmlLinks } from '@/features/campaigns/lib/action-helpers'
import { classifyEmailThread } from '@/features/campaigns/lib/thread-classifier'
import type { ProviderIssue } from '@/features/campaigns/lib/model-json'
import { recordProviderIssues } from './provider-alerts'

const FIRST_WINDOW_MS = 14 * 24 * 60 * 60 * 1000
const PAGE_SIZE = 5

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
  internalDate?: string
  payload?: {
    headers: GmailHeader[]
    mimeType: string
    body?: {
      data?: string
    }
    parts?: GmailPart[]
  }
}

interface ListedMessage {
  id: string
  threadId: string
  internalDate: number
}

export interface SyncResult {
  success: boolean
  newDealsCount: number
  updatedDealsCount: number
  totalScanned: number
  notice?: string
  noticeTone?: 'ok' | 'warn'
  error?: string
}

/**
 * Recursively decodes email body text from Gmail API payload
 */
function extractBodyFromPayload(payload?: GmailMessageDetail['payload']): string {
  if (!payload) return ''
  const collected = { plain: '', html: '' }
  collectBodies(payload, collected)
  const text = (collected.plain || stripHtml(collected.html)).trim()
  return appendHtmlLinks(text, collected.html)
}

function collectBodies(
  part: {
    mimeType?: string
    body?: { data?: string }
    parts?: GmailPart[]
  },
  collected: { plain: string; html: string }
): void {
  if (part.body?.data && part.mimeType === 'text/plain' && !collected.plain) {
    collected.plain = decodeBase64Url(part.body.data)
  }
  if (part.body?.data && part.mimeType === 'text/html' && !collected.html) {
    collected.html = decodeBase64Url(part.body.data)
  }
  for (const child of part.parts ?? []) {
    collectBodies(child, collected)
  }
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

function getHeader(headers: GmailHeader[] | undefined, name: string): string {
  const h = headers?.find((header) => header.name.toLowerCase() === name.toLowerCase())
  return h?.value || ''
}

function gmailAfterDate(ms: number): string {
  const date = new Date(ms)
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}/${month}/${day}`
}

export async function syncUserGmailCampaigns(userId: string): Promise<SyncResult> {
  const accessToken = await getValidGoogleAccessToken(userId)
  if (!accessToken) {
    return emptyResult({ success: false, error: 'Not connected to Google' })
  }

  const supabase = await createClient()
  const { data: integration } = await supabase
    .from('user_email_integrations')
    .select('email_address, gmail_sync_cursor_ms, gmail_sync_page_token')
    .eq('user_id', userId)
    .eq('provider', 'google')
    .single()

  if (!integration) {
    return emptyResult({ success: false, error: 'Not connected to Google' })
  }

  const userEmail = integration.email_address?.toLowerCase() || ''
  const syncStartedMs = Date.now()
  const cursorMs = integration.gmail_sync_cursor_ms
  const queryAfterMs = cursorMs ?? syncStartedMs - FIRST_WINDOW_MS
  let pageToken = integration.gmail_sync_page_token

  const { data: existingCampaigns } = await supabase
    .from('creator_campaigns')
    .select('id, source_message_id')
    .eq('user_id', userId)

  const cardsByThread = new Map<string, string>()
  for (const campaign of existingCampaigns || []) {
    if (campaign.source_message_id) {
      cardsByThread.set(campaign.source_message_id, campaign.id)
    }
  }

  let newDealsCount = 0
  let updatedDealsCount = 0
  let totalScanned = 0
  const issues: ProviderIssue[] = []
  let readerStopped = false

  const listed = await listMessagePage(accessToken, queryAfterMs, pageToken)
  if (!listed.ok) {
    return emptyResult({ success: false, error: 'Failed to search Gmail' })
  }

  const metas = await Promise.all(
    listed.messages.map((ref) => readMessageMeta(accessToken, ref.id))
  )
  if (listed.messages.length > 0 && metas.some((meta) => meta == null)) {
    return emptyResult({ success: false, error: 'Failed to read Gmail' })
  }

  const fresh = metas.filter((meta): meta is ListedMessage => {
    if (!meta) return false
    if (cursorMs != null && meta.internalDate <= cursorMs) return false
    return true
  })

  const pageIsOlderThanCursor =
    cursorMs != null && listed.messages.length > 0 && fresh.length === 0

  totalScanned = fresh.length
  pageToken = pageIsOlderThanCursor ? null : (listed.nextPageToken ?? null)

  for (const threadId of uniqueThreads(fresh)) {
    const transcript = await readThreadTranscript(accessToken, threadId)
    if (!transcript.text) continue

    const classified = await classifyEmailThread({
      transcript: transcript.text,
      userEmail,
    })
    issues.push(...classified.issues)

    if (!classified.ok) {
      readerStopped = true
      const modelAnswered = classified.issues.some(
        (issue) => issue.detail === 'Model reply was not usable JSON'
      )
      const providerDown = classified.issues.some(
        (issue) => issue.detail !== 'Model reply was not usable JSON'
      )
      if (providerDown && !modelAnswered) break
      continue
    }

    if (classified.decision === 'ignore') continue

    const existingId = cardsByThread.get(threadId)
    if (existingId) {
      const updated = await updateCampaignCard(supabase, userId, existingId, classified, transcript)
      if (updated) updatedDealsCount += 1
    } else if (await insertCampaignCard(supabase, userId, threadId, classified, transcript)) {
      newDealsCount += 1
      cardsByThread.set(threadId, threadId)
    }
  }

  if (!readerStopped) {
    await supabase
      .from('user_email_integrations')
      .update({
        gmail_sync_page_token: pageToken,
        gmail_sync_cursor_ms: pageToken ? (cursorMs ?? queryAfterMs) : syncStartedMs,
        last_synced_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('provider', 'google')
  } else {
    await supabase
      .from('user_email_integrations')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('provider', 'google')
  }

  if (issues.length > 0) {
    await recordProviderIssues(issues)
  }

  const saved = newDealsCount + updatedDealsCount
  const notice = readerStopped
    ? saved > 0
      ? `Saved ${saved}. Email reader stopped. Sync again in a few minutes.`
      : 'Email reader is unavailable. No new cards.'
    : undefined

  return {
    success: true,
    newDealsCount,
    updatedDealsCount,
    totalScanned,
    notice,
    noticeTone: notice ? 'warn' : undefined,
  }
}

function emptyResult(partial: Pick<SyncResult, 'success' | 'error'>): SyncResult {
  return {
    success: partial.success,
    newDealsCount: 0,
    updatedDealsCount: 0,
    totalScanned: 0,
    error: partial.error,
  }
}

async function listMessagePage(
  accessToken: string,
  queryAfterMs: number,
  pageToken: string | null
): Promise<{ ok: true; messages: { id: string; threadId: string }[]; nextPageToken?: string } | { ok: false }> {
  const query = `-from:me -category:social after:${gmailAfterDate(queryAfterMs)}`
  const url = new URL('https://gmail.googleapis.com/gmail/v1/users/me/messages')
  url.searchParams.set('q', query)
  url.searchParams.set('maxResults', String(PAGE_SIZE))
  if (pageToken) url.searchParams.set('pageToken', pageToken)

  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } })
  if (!res.ok) {
    console.error('[syncUserGmailCampaigns] Gmail list error:', res.status)
    return { ok: false }
  }

  const data = (await res.json()) as {
    messages?: { id: string; threadId: string }[]
    nextPageToken?: string
  }
  return { ok: true, messages: data.messages ?? [], nextPageToken: data.nextPageToken }
}

async function readMessageMeta(accessToken: string, messageId: string): Promise<ListedMessage | null> {
  const url = new URL(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`)
  url.searchParams.set('format', 'metadata')

  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } })
  if (!res.ok) return null

  const msg = (await res.json()) as GmailMessageDetail
  const internalDate = Number(msg.internalDate)
  if (!msg.threadId || !Number.isFinite(internalDate)) return null
  return { id: msg.id, threadId: msg.threadId, internalDate }
}

function uniqueThreads(messages: ListedMessage[]): string[] {
  const ids: string[] = []
  for (const message of messages) {
    if (!ids.includes(message.threadId)) ids.push(message.threadId)
  }
  return ids
}

async function readThreadTranscript(
  accessToken: string,
  threadId: string
): Promise<{ text: string; from: string; subject: string }> {
  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}?format=full`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  if (!res.ok) return { text: '', from: '', subject: '' }

  const data = (await res.json()) as { messages?: GmailMessageDetail[] }
  const messages = [...(data.messages ?? [])].sort(
    (a, b) => Number(a.internalDate ?? 0) - Number(b.internalDate ?? 0)
  )
  const chosen = messages.length > 5 ? [messages[0], ...messages.slice(-4)] : messages

  const blocks = chosen.map((message) => {
    const from = getHeader(message.payload?.headers, 'From')
    const subject = getHeader(message.payload?.headers, 'Subject')
    const body = extractBodyFromPayload(message.payload).slice(0, 1800)
    return `From: ${from}\nSubject: ${subject}\n${body}`
  })

  const latest = messages[messages.length - 1]
  return {
    text: blocks.join('\n\n---\n\n').slice(0, 9000),
    from: getHeader(latest?.payload?.headers, 'From'),
    subject: getHeader(latest?.payload?.headers, 'Subject'),
  }
}

type SupabaseServer = Awaited<ReturnType<typeof createClient>>
type ClassifiedCard = Extract<
  Awaited<ReturnType<typeof classifyEmailThread>>,
  { ok: true; decision: 'action' | 'update' }
>

async function insertCampaignCard(
  supabase: SupabaseServer,
  userId: string,
  threadId: string,
  classified: ClassifiedCard,
  transcript: { text: string; from: string; subject: string }
): Promise<boolean> {
  const { error } = await supabase.from('creator_campaigns').insert({
    user_id: userId,
    brand_name: classified.card.brandName,
    brand_logo_url: classified.card.brandLogoUrl,
    product_name: classified.card.productName,
    compensation: classified.card.compensation,
    deliverables: classified.card.deliverables,
    deadline: classified.card.deadline,
    action_url: classified.card.actionUrl,
    next_step: classified.card.nextStep,
    parser_model: classified.model,
    status: 'NEW_PITCH',
    raw_source_text: transcript.text,
    source_type: 'EMAIL',
    source_sender: transcript.from,
    source_subject: transcript.subject,
    source_message_id: threadId,
  })

  if (error) {
    console.error('[syncUserGmailCampaigns] Insert error:', error)
    return false
  }
  return true
}

async function updateCampaignCard(
  supabase: SupabaseServer,
  userId: string,
  campaignId: string,
  classified: ClassifiedCard,
  transcript: { text: string; from: string; subject: string }
): Promise<boolean> {
  const card = classified.card
  const { error } = await supabase
    .from('creator_campaigns')
    .update({
      brand_name: card.brandName,
      ...(card.brandLogoUrl ? { brand_logo_url: card.brandLogoUrl } : {}),
      ...(card.productName ? { product_name: card.productName } : {}),
      ...(card.compensation ? { compensation: card.compensation } : {}),
      ...(card.deliverables ? { deliverables: card.deliverables } : {}),
      ...(card.deadline ? { deadline: card.deadline } : {}),
      ...(card.actionUrl ? { action_url: card.actionUrl } : {}),
      next_step: card.nextStep,
      parser_model: classified.model,
      raw_source_text: transcript.text,
      source_sender: transcript.from,
      source_subject: transcript.subject,
      updated_at: new Date().toISOString(),
    })
    .eq('id', campaignId)
    .eq('user_id', userId)

  if (error) {
    console.error('[syncUserGmailCampaigns] Update error:', error)
    return false
  }
  return true
}
