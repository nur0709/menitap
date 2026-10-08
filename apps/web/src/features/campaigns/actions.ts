'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { CampaignStatus, CreatorCampaign } from './types'

const ManualCampaignSchema = z.object({
  brand_name: z.string().min(1, 'Brand name is required'),
  product_name: z.string().optional().default(''),
  compensation: z.string().optional().default(''),
  deliverables: z.string().optional().default(''),
  deadline: z.string().optional().default(''),
  status: z
    .enum(['NEW_PITCH', 'REVIEWED', 'ACCEPTED', 'FILMING', 'DELIVERED', 'PAID', 'DECLINED'])
    .default('NEW_PITCH'),
  brand_logo_url: z.string().nullable().optional(),
  raw_source_text: z.string().optional().default(''),
  notes: z.string().optional().default(''),
})

export type CampaignActionState = {
  error?: string
  success?: string
}

export async function getUserCampaigns(): Promise<CreatorCampaign[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('creator_campaigns')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching creator campaigns:', error)
    return []
  }

  return (data || []) as CreatorCampaign[]
}

export async function createManualCampaign(
  prevState: CampaignActionState | null,
  formData: FormData
): Promise<CampaignActionState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in to add a campaign' }
  }

  const rawData = {
    brand_name: (formData.get('brand_name') as string)?.trim() || '',
    product_name: (formData.get('product_name') as string)?.trim() || '',
    compensation: (formData.get('compensation') as string)?.trim() || '',
    deliverables: (formData.get('deliverables') as string)?.trim() || '',
    deadline: (formData.get('deadline') as string)?.trim() || '',
    status: (formData.get('status') as string)?.trim() || 'NEW_PITCH',
    brand_logo_url: (formData.get('brand_logo_url') as string)?.trim() || null,
    raw_source_text: (formData.get('raw_source_text') as string)?.trim() || '',
    notes: (formData.get('notes') as string)?.trim() || '',
  }

  const validation = ManualCampaignSchema.safeParse(rawData)
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || 'Validation failed' }
  }

  const deadlineDate = validation.data.deadline
    ? new Date(validation.data.deadline).toISOString()
    : null

  const { error } = await supabase.from('creator_campaigns').insert({
    user_id: user.id,
    brand_name: validation.data.brand_name,
    brand_logo_url: validation.data.brand_logo_url || null,
    product_name: validation.data.product_name || null,
    compensation: validation.data.compensation || null,
    deliverables: validation.data.deliverables || null,
    deadline: deadlineDate,
    status: validation.data.status,
    raw_source_text: validation.data.raw_source_text || null,
    source_type: 'MANUAL',
    notes: validation.data.notes || null,
  })

  if (error) {
    console.error('Error inserting creator campaign:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: 'Campaign added successfully!' }
}

export async function updateCampaignStatus(
  campaignId: string,
  newStatus: CampaignStatus
): Promise<{ error?: string; success?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('creator_campaigns')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', campaignId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating campaign status:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: `Status changed to ${newStatus}` }
}

export async function toggleCampaignLiked(
  campaignId: string,
  isLiked: boolean
): Promise<{ error?: string; success?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('creator_campaigns')
    .update({ is_liked: isLiked, updated_at: new Date().toISOString() })
    .eq('id', campaignId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error toggling campaign like:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: isLiked ? 'Campaign saved to favorites' : 'Removed from favorites' }
}

export async function bulkDeleteCampaigns(
  campaignIds: string[]
): Promise<{ error?: string; success?: string; count?: number }> {
  if (!campaignIds || campaignIds.length === 0) {
    return { error: 'No campaigns selected' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('creator_campaigns')
    .delete()
    .in('id', campaignIds)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting campaigns in bulk:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: `Deleted ${campaignIds.length} campaigns.`, count: campaignIds.length }
}

