export type CampaignStatus =
  | 'NEW_PITCH'
  | 'REVIEWED'
  | 'ACCEPTED'
  | 'FILMING'
  | 'DELIVERED'
  | 'PAID'
  | 'DECLINED'

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
  notes: string | null
  created_at: string
  updated_at: string
}
