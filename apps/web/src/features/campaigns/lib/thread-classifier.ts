import { z } from 'zod'
import { extractApplyLink } from './action-helpers'
import { cardTitleFromSender } from './email-card-parser'
import {
  completeWithModels,
  extractJsonObject,
  type ModelCompletion,
  type ProviderIssue,
} from './model-json'

const CAMPAIGN_NEXT_STEPS = [
  'reply',
  'fill_form',
  'submit_content',
  'waiting',
  'review_list',
] as const

type CampaignNextStep = (typeof CAMPAIGN_NEXT_STEPS)[number]

interface ThreadCardFields {
  brandName: string
  productName: string | null
  compensation: string | null
  deliverables: string | null
  deadline: string | null
  actionUrl: string | null
  nextStep: CampaignNextStep
  brandLogoUrl: string | null
}

export type ThreadClassification =
  | { ok: true; model: string; decision: 'ignore'; issues: ProviderIssue[] }
  | {
      ok: true
      model: string
      decision: 'action' | 'update'
      card: ThreadCardFields
      issues: ProviderIssue[]
    }
  | { ok: false; issues: ProviderIssue[] }

const decisionSchema = z.object({
  decision: z.enum(['action', 'update', 'ignore']),
  brandName: z.string().nullable().optional(),
  productName: z.string().nullable().optional(),
  compensation: z.string().nullable().optional(),
  deliverables: z.string().nullable().optional(),
  deadline: z.string().nullable().optional(),
  actionUrl: z.string().nullable().optional(),
  nextStep: z.enum(CAMPAIGN_NEXT_STEPS).nullable().optional(),
  brandDomain: z.string().nullable().optional(),
})

/**
 * One thread in, one decision out. Action and update both carry card fields.
 * Ignore writes nothing. A digest is one card or an ignore, never a split.
 */
export async function classifyEmailThread(params: {
  transcript: string
  userEmail: string
}): Promise<ThreadClassification> {
  const transcript = params.transcript.trim().slice(0, 9000)
  if (!transcript) {
    return { ok: true, model: 'none', decision: 'ignore', issues: [] }
  }

  const completion: ModelCompletion<z.infer<typeof decisionSchema>> = await completeWithModels(
    buildPrompt(transcript, params.userEmail),
    (raw) => {
      const json = extractJsonObject(raw)
      const parsed = decisionSchema.safeParse(json)
      return parsed.success ? parsed.data : null
    }
  )

  if (!completion.ok) {
    return { ok: false, issues: completion.issues }
  }

  if (completion.value.decision === 'ignore') {
    return {
      ok: true,
      model: completion.model,
      decision: 'ignore',
      issues: completion.issues,
    }
  }

  const card = toCard(completion.value, transcript, params.userEmail)
  if (!card) {
    return {
      ok: true,
      model: completion.model,
      decision: 'ignore',
      issues: completion.issues,
    }
  }

  return {
    ok: true,
    model: completion.model,
    decision: completion.value.decision,
    card,
    issues: completion.issues,
  }
}

function buildPrompt(transcript: string, userEmail: string): string {
  return `You sort one Gmail thread for a UGC creator. Decide if it needs a card.

The creator's address is ${userEmail || 'unknown'}.

Return only JSON:
{
  "decision": "action" | "update" | "ignore",
  "brandName": "who sent this email",
  "productName": "client brand and product",
  "compensation": "$30 on posting, or gifted, or empty",
  "deliverables": "what they must make, or empty",
  "deadline": "YYYY-MM-DD or empty",
  "actionUrl": "the apply or form https link, or empty",
  "nextStep": "reply" | "fill_form" | "submit_content" | "waiting" | "review_list",
  "brandDomain": "sender domain, or empty"
}

decision:
- action: the creator still needs to reply, fill a form, submit content, or review one personal list.
- update: this thread continues a campaign (guidelines, shipping, contract, closed, or waiting on the brand).
- ignore: retail, coupons, receipts, job boards, community mail, generic weekly roundups, and anything that does not need a creator action.

Rules:
- One thread is one decision. Never split a newsletter or digest into several campaigns.
- A digest of many briefs is review_list only when it is a personal list the creator was sent. A generic weekly roundup is ignore.
- brandName is who sent the email. That is the card title.
- If a platform, marketplace, or agency sent it, brandName is that sender. Nurilounge stays Nurilounge. The Cirqle stays The Cirqle. Put the client brand and product in productName, such as "ISOI - Spot the Petals eye patch".
- brandName is the client brand only when that brand sent the email from its own address.
- compensation is the amount written in the email. Copy "$30 on posting" when that is what it says. Never answer with the word "pay" alone.
- If the Links list has an apply or form url, nextStep is fill_form and actionUrl is that url.
- If the latest message is from the creator, nextStep is waiting.
- Leave deadline and deliverables empty when the thread does not state them.

Thread:
${transcript}`
}

function toCard(
  value: z.infer<typeof decisionSchema>,
  transcript: string,
  userEmail: string
): ThreadCardFields | null {
  const sender = senderFromTranscript(transcript, userEmail)
  const senderTitle = sender ? cardTitleFromSender(sender) : null
  const modelBrand = cleanText(value.brandName, 80)
  const brand = senderTitle?.name || modelBrand
  if (!brand) return null

  let product = cleanText(value.productName, 140)
  if (modelBrand && modelBrand.toLowerCase() !== brand.toLowerCase()) {
    if (!product) product = modelBrand
    else if (!product.toLowerCase().includes(modelBrand.toLowerCase())) {
      product = `${modelBrand} - ${product}`.slice(0, 140)
    }
  }
  if (senderTitle && product) {
    const viaSender = new RegExp(`\\s+via\\s+${escapeRegExp(senderTitle.name)}\\s*$`, 'i')
    product = product.replace(viaSender, '').trim() || null
  }

  const foundApply = extractApplyLink(transcript)
  const modelUrl = cleanActionUrl(value.actionUrl)
  const modelUrlIsApply = modelUrl ? extractApplyLink(modelUrl) : null
  const actionUrl = modelUrlIsApply || foundApply || modelUrl
  let nextStep = value.nextStep ?? (actionUrl && foundApply ? 'fill_form' : 'reply')
  if (foundApply && nextStep === 'reply') nextStep = 'fill_form'

  const domain = senderTitle?.domain || cleanDomain(value.brandDomain)

  return {
    brandName: brand,
    productName: product,
    compensation: cleanCompensation(value.compensation, transcript),
    deliverables: cleanText(value.deliverables, 160),
    deadline: cleanDeadline(value.deadline),
    actionUrl,
    nextStep,
    brandLogoUrl: domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : null,
  }
}

function senderFromTranscript(transcript: string, userEmail: string): string | null {
  const user = userEmail.toLowerCase()
  for (const match of transcript.matchAll(/^From:\s*(.+)$/gm)) {
    const from = match[1]?.trim()
    if (!from) continue
    if (user && from.toLowerCase().includes(user)) continue
    return from
  }
  return null
}

function cleanCompensation(value: string | null | undefined, transcript: string): string | null {
  const text = cleanText(value, 120)
  const vague = !text || /^(pay|paid|payment|compensation|paid collab)$/i.test(text)
  if (!vague) return text
  const amount = transcript.match(
    /\$\s?\d{1,3}(?:,\d{3})*(?:\.\d{2})?(?:\s+(?:upon|on|per|for|after)\s+[A-Za-z]+){0,3}/i
  )
  return amount ? amount[0].replace(/\s+/g, ' ').trim() : null
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function cleanText(value: string | null | undefined, max: number): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.slice(0, max)
}

function cleanDeadline(value: string | null | undefined): string | null {
  if (!value) return null
  const match = value.trim().match(/^(\d{4}-\d{2}-\d{2})/)
  if (!match) return null
  const date = new Date(`${match[1]}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

function cleanActionUrl(value: string | null | undefined): string | null {
  if (!value) return null
  const trimmed = value.trim().replace(/[>),.\]]+$/, '')
  if (!trimmed.startsWith('https://') || trimmed.length > 500) return null
  try {
    const url = new URL(trimmed)
    if (url.username || url.password) return null
    if (url.protocol !== 'https:') return null
    return url.toString()
  } catch {
    return null
  }
}

function cleanDomain(value: string | null | undefined): string | null {
  if (!value) return null
  const host = value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .split('/')[0]
    ?.split(':')[0]
  if (!host || !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(host)) return null
  return host
}
