/**
 * Canonical workflow status stages for creator brand deals and collaborations.
 */
export type CanonicalCampaignStatus =
  | 'NEW_PITCH'
  | 'REVIEWED'
  | 'APPLIED'
  | 'WAITING_PRODUCT'
  | 'SUBMITTED'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'DECLINED'

/**
 * Union of canonical stages and historical / database aliases.
 */
export type CampaignStatus =
  | CanonicalCampaignStatus
  | 'ACCEPTED'
  | 'PRODUCT_RECEIVED'
  | 'FILMING'
  | 'CONTENT_SUBMITTED'
  | 'DELIVERED'
  | 'WAITING_PAYMENT'

/**
 * Normalizes any campaign status (including historical database aliases)
 * to its canonical workflow stage.
 */
export function normalizeCampaignStatus(
  status: string | null | undefined
): CanonicalCampaignStatus {
  switch (status) {
    case 'ACCEPTED':
      return 'APPLIED'
    case 'PRODUCT_RECEIVED':
      return 'WAITING_PRODUCT'
    case 'FILMING':
    case 'CONTENT_SUBMITTED':
      return 'SUBMITTED'
    case 'DELIVERED':
    case 'WAITING_PAYMENT':
      return 'PAYMENT_PENDING'
    case 'NEW_PITCH':
    case 'REVIEWED':
    case 'APPLIED':
    case 'WAITING_PRODUCT':
    case 'SUBMITTED':
    case 'PAYMENT_PENDING':
    case 'PAID':
    case 'DECLINED':
      return status
    default:
      return 'NEW_PITCH'
  }
}

export function nextStepLabel(step: string | null | undefined): string | null {
  switch (step) {
    case 'reply':
      return 'Reply'
    case 'fill_form':
      return 'Fill the form'
    case 'submit_content':
      return 'Submit content'
    case 'waiting':
      return 'Waiting on them'
    case 'review_list':
      return 'Review this list'
    default:
      return null
  }
}

export type CampaignSourceType = 'EMAIL' | 'MANUAL' | 'EXTENSION'

export interface CreatorCampaign {
  id: string
  user_id: string
  brand_name: string
  brand_logo_url: string | null
  product_name: string | null
  compensation: string | null
  deliverables: string | null
  deadline: string | null
  status: CampaignStatus
  raw_source_text: string | null
  source_type: CampaignSourceType
  source_sender: string | null
  source_subject: string | null
  source_message_id?: string | null
  notes: string | null
  next_step?: string | null
  action_url?: string | null
  parser_model?: string | null
  is_liked?: boolean
  created_at: string
  updated_at: string
}

