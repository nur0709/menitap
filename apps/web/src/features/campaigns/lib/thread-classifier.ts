import { z } from 'zod'
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
  platformName: z.string().nullable().optional(),
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

  const card = toCard(completion.value)
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
  "brandName": "client brand",
  "productName": "product or campaign",
  "platformName": "marketplace or agency, or empty",
  "compensation": "pay or gifted, or empty",
  "deliverables": "what they must make, or empty",
  "deadline": "YYYY-MM-DD or empty",
  "actionUrl": "one https link, or empty",
  "nextStep": "reply" | "fill_form" | "submit_content" | "waiting" | "review_list",
  "brandDomain": "client domain, or empty"
}

decision:
- action: the creator still needs to reply, fill a form, submit content, or review one personal list.
- update: this thread continues a campaign (guidelines, shipping, contract, closed, or waiting on the brand).
- ignore: retail, coupons, receipts, job boards, community mail, generic weekly roundups, and anything that does not need a creator action.

Rules:
- One thread is one decision. Never split a newsletter or digest into several campaigns.
- A digest of many briefs is review_list only when it is a personal list the creator was sent. A generic weekly roundup is ignore.
- brandName is the client the creator would make content for. Old Navy stays Old Navy when CreatorIQ, The Cirqle, or an agency sends the mail. Put that sender in platformName.
- If the thread names no client, brandName may be the platform or agency.
- If the latest message is from the creator, nextStep is waiting.
- actionUrl is the single most useful https link for the next step. Leave it empty when there is none.
- Leave pay, deadline, and deliverables empty when the thread does not state them.

Thread:
${transcript}`
}

function toCard(value: z.infer<typeof decisionSchema>): ThreadCardFields | null {
  const platform = cleanText(value.platformName, 80)
  const brand = cleanText(value.brandName, 80) || platform
  if (!brand) return null

  const product = cleanText(value.productName, 120)
  const productName =
    product && platform && platform.toLowerCase() !== brand.toLowerCase()
      ? `${product} via ${platform}`.slice(0, 140)
      : product || (platform && platform.toLowerCase() !== brand.toLowerCase() ? `via ${platform}` : null)

  const domain = cleanDomain(value.brandDomain)

  return {
    brandName: brand,
    productName,
    compensation: cleanText(value.compensation, 120),
    deliverables: cleanText(value.deliverables, 160),
    deadline: cleanDeadline(value.deadline),
    actionUrl: cleanActionUrl(value.actionUrl),
    nextStep: value.nextStep ?? 'reply',
    brandLogoUrl: domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : null,
  }
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
