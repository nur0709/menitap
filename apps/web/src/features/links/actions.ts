'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const AffiliateLinkSchema = z.object({
  product_url: z.string().url('Please enter a valid product / affiliate URL (e.g. https://...)'),
  promo_code: z.string().optional().default(''),
  category_id: z.coerce.number().positive('Please select a category'),
  title: z.string().optional().default(''),
  image_url: z.string().nullable().optional(),
})

const BrandLinkSchema = z.object({
  brand_name: z.string().min(2, 'Brand name must be at least 2 characters'),
  application_url: z.string().url('Please enter a valid brand application or collab URL (including https://)'),
  category_id: z.coerce.number().positive('Please select a valid category'),
  description: z.string().nullable().optional(),
  products_provided: z.preprocess((val) => val === 'on' || val === true || val === 'true', z.boolean()),
  image_url: z.string().nullable().optional(),
})

export type LinkActionState = {
  error?: string
  success?: string
}

export async function createAffiliateLink(
  prevState: LinkActionState | null,
  formData: FormData
): Promise<LinkActionState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in to submit a link' }
  }

  // Verify user is CREATOR or ADMIN
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = (profile?.role || '').toUpperCase()
  if (role !== 'CREATOR' && role !== 'ADMIN') {
    return { error: 'Only creator accounts can post affiliate deals.' }
  }

  const rawUrl = (formData.get('product_url') as string)?.trim() || ''
  const formattedUrl = rawUrl.startsWith('http://') || rawUrl.startsWith('https://')
    ? rawUrl
    : `https://${rawUrl}`

  const rawData = {
    product_url: formattedUrl,
    promo_code: (formData.get('promo_code') as string)?.trim() || '',
    category_id: formData.get('category_id'),
    title: (formData.get('title') as string)?.trim() || '',
    image_url: (formData.get('image_url') as string)?.trim() || null,
  }

  const validation = AffiliateLinkSchema.safeParse(rawData)
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || 'Validation failed' }
  }

  // Auto-generate title if empty from host URL
  let autoTitle = validation.data.title
  if (!autoTitle) {
    try {
      const parsed = new URL(validation.data.product_url)
      autoTitle = `Affiliate Deal on ${parsed.hostname.replace('www.', '')}`
    } catch {
      autoTitle = 'Affiliate Deal'
    }
  }

  const { error } = await supabase.from('affiliate_links').insert({
    user_id: user.id,
    category_id: validation.data.category_id,
    title: autoTitle,
    product_url: validation.data.product_url,
    promo_code: validation.data.promo_code || null,
    image_url: validation.data.image_url || null,
    status: 'ACTIVE', // Automatically active for creators
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/deals')
  revalidatePath('/dashboard')
  return { success: 'Your affiliate link was published successfully!' }
}

export async function createBrandLink(
  prevState: LinkActionState | null,
  formData: FormData
): Promise<LinkActionState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in to submit a link' }
  }

  const rawData = {
    brand_name: formData.get('brand_name'),
    application_url: formData.get('application_url'),
    category_id: formData.get('category_id'),
    description: formData.get('description') || '',
    products_provided: formData.get('products_provided'),
    image_url: (formData.get('image_url') as string)?.trim() || null,
  }

  const validation = BrandLinkSchema.safeParse(rawData)
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || 'Validation failed' }
  }

  // Verify user is BRAND or ADMIN
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = (profile?.role || '').toUpperCase()
  if (role !== 'BRAND' && role !== 'ADMIN') {
    return { error: 'Only brand accounts can post campaign links.' }
  }

  const { error } = await supabase.from('brand_links').insert({
    user_id: user.id,
    category_id: validation.data.category_id,
    brand_name: validation.data.brand_name,
    application_url: validation.data.application_url,
    description: validation.data.description || null,
    products_provided: validation.data.products_provided,
    image_url: validation.data.image_url || null,
    status: 'ACTIVE',
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/collabs')
  revalidatePath('/dashboard')
  return { success: 'Campaign link posted successfully!' }
}

const PublicCampaignSchema = z.object({
  brand_name: z.string().min(2, 'Brand name must be at least 2 characters'),
  contact_email: z.string().email('Please enter a valid work or brand email'),
  application_url: z.string().url('Please enter a valid brand application or collab URL (including https://)'),
  category_id: z.coerce.number().positive('Please select a category'),
  compensation_details: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  products_provided: z.preprocess((val) => val === 'on' || val === true || val === 'true', z.boolean()),
  image_url: z.string().nullable().optional(),
})

export async function submitPublicBrandCampaign(
  prevState: LinkActionState | null,
  formData: FormData
): Promise<LinkActionState> {
  const rawUrl = (formData.get('application_url') as string)?.trim() || ''
  if (!rawUrl) {
    return { error: 'Please enter a valid brand application or collab URL' }
  }

  const formattedUrl = rawUrl.startsWith('http://') || rawUrl.startsWith('https://')
    ? rawUrl
    : `https://${rawUrl}`

  const comp = (formData.get('compensation_details') as string)?.trim()
  const desc = (formData.get('description') as string)?.trim()
  const brandName = ((formData.get('brand_name') as string) || '').trim()
  const contactEmail = ((formData.get('contact_email') as string) || '').trim()

  const rawData = {
    brand_name: brandName,
    contact_email: contactEmail,
    application_url: formattedUrl,
    category_id: formData.get('category_id'),
    compensation_details: comp ? comp : null,
    description: desc ? desc : null,
    products_provided: formData.get('products_provided'),
    image_url: (formData.get('image_url') as string)?.trim() || null,
  }

  const validation = PublicCampaignSchema.safeParse(rawData)
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || 'Validation failed' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Public submissions from /post-collab must always enter the pending review queue
  const status = 'PENDING'

  const { error } = await supabase.from('brand_links').insert({
    user_id: user?.id || null,
    category_id: validation.data.category_id,
    brand_name: validation.data.brand_name,
    contact_email: validation.data.contact_email,
    application_url: validation.data.application_url,
    description: validation.data.description || null,
    compensation_details: validation.data.compensation_details || null,
    products_provided: validation.data.products_provided,
    image_url: validation.data.image_url || null,
    status,
  })

  if (error) {
    console.error('Error submitting public campaign:', error)
    return { error: error.message }
  }

  revalidatePath('/collabs')
  return {
    success: 'Campaign received! Our team will review and publish it within 24 hours.',
  }
}

export async function getCategories(type: 'DEALS' | 'CREATORS' | 'BRANDS' = 'DEALS') {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .eq('type', type)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return data || []
}

export async function getAllCategories() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching all categories:', error)
    return []
  }

  return data || []
}

export async function deleteAffiliateLink(linkId: number): Promise<{ error?: string; success?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in to delete a deal.' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'ADMIN'

  let query = supabase.from('affiliate_links').delete().eq('id', linkId)
  if (!isAdmin) {
    query = query.eq('user_id', user.id)
  }

  const { error } = await query

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/deals')
  revalidatePath('/dashboard')
  return { success: 'Affiliate deal removed.' }
}

export async function addCategory(
  name: string,
  type: 'DEALS' | 'CREATORS' | 'BRANDS'
): Promise<{ error?: string; success?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in.' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'ADMIN') {
    return { error: 'Only admins can add categories.' }
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  if (!slug) {
    return { error: 'Please provide a valid category name.' }
  }

  const { error } = await supabase.from('categories').insert({
    name,
    slug,
    type,
    is_active: true,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: `Category "${name}" added to ${type}!` }
}

export async function deleteCategory(categoryId: number): Promise<{ error?: string; success?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in.' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'ADMIN') {
    return { error: 'Only admins can remove categories.' }
  }

  const { error } = await supabase.from('categories').delete().eq('id', categoryId)
  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: 'Category removed.' }
}

export async function getExploreDeals(categoryId?: number) {
  const supabase = await createClient()

  let query = supabase
    .from('affiliate_links')
    .select('id, user_id, title, product_url, promo_code, image_url, click_count, created_at, category_id, categories(name, slug), profiles(full_name)')
    .in('status', ['ACTIVE', 'APPROVED'])
    .order('created_at', { ascending: false })
    .limit(100)

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  const { data, error } = await query
  if (error) {
    console.error('Error fetching explore deals:', error)
    return []
  }

  return data || []
}

export async function getUserLinks() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { affiliateLinks: [] }

  const { data, error } = await supabase
    .from('affiliate_links')
    .select('*, categories(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user affiliate links:', error)
    return { affiliateLinks: [] }
  }

  return {
    affiliateLinks: data || [],
  }
}

export async function getUserBrandLinks() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { brandLinks: [] }

  const { data, error } = await supabase
    .from('brand_links')
    .select('*, categories(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user brand links:', error)
    return { brandLinks: [] }
  }

  return {
    brandLinks: data || [],
  }
}

export async function getCampaignLinks(categoryId?: number) {
  const supabase = await createClient()

  let query = supabase
    .from('brand_links')
    .select(
      'id, user_id, brand_name, application_url, description, image_url, products_provided, compensation_details, deadline, deliverables, requirements, source_platform, is_verified, click_count, created_at, category_id, categories(name, slug), profiles(full_name)'
    )
    .in('status', ['ACTIVE', 'APPROVED'])
    .order('created_at', { ascending: false })
    .limit(100)

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  const { data, error } = await query
  if (error) {
    console.error('Error fetching campaign links:', error)
    return []
  }

  return data || []
}

export async function deleteBrandLink(linkId: number): Promise<{ error?: string; success?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in to delete a campaign.' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'ADMIN'

  let query = supabase.from('brand_links').delete().eq('id', linkId)
  if (!isAdmin) {
    query = query.eq('user_id', user.id)
  }

  const { error } = await query

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/collabs')
  revalidatePath('/dashboard')
  return { success: 'Campaign removed.' }
}

export async function getPendingBrandLinks() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'ADMIN') return []

  const { data, error } = await supabase
    .from('brand_links')
    .select('*, categories(name)')
    .eq('status', 'PENDING')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching pending brand links:', error)
    return []
  }

  return data || []
}

export async function getPendingCampaignsCount(): Promise<number> {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from('brand_links')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'PENDING')

  if (error) {
    console.error('Error fetching pending campaigns count:', error)
    return 0
  }

  return count || 0
}

export async function approveBrandLink(linkId: number): Promise<{ error?: string; success?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'ADMIN') {
    return { error: 'Only admins can approve campaigns.' }
  }

  const { error } = await supabase
    .from('brand_links')
    .update({ status: 'ACTIVE' })
    .eq('id', linkId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/collabs')
  revalidatePath('/dashboard')
  return { success: 'Campaign approved and published live!' }
}

export async function adminDeleteBrandLink(linkId: number): Promise<{ error?: string; success?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'ADMIN') {
    return { error: 'Only admins can delete campaigns.' }
  }

  const { error } = await supabase
    .from('brand_links')
    .delete()
    .eq('id', linkId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/collabs')
  revalidatePath('/dashboard')
  return { success: 'Campaign rejected and deleted.' }
}

export async function getPublicCreators() {
  const supabase = await createClient()

  // Fetch all active profiles with public profile enabled (CREATOR and ADMIN only)
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, bio, instagram_url, tiktok_url, youtube_url, role, is_public_profile, created_at')
    .eq('is_public_profile', true)
    .in('role', ['CREATOR', 'ADMIN'])
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error fetching public creators:', error)
    return []
  }

  return data || []
}

export async function trackCollabInCrm(
  collabId: number
): Promise<{ success?: boolean; error?: string; campaignId?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Please sign in to track this collaboration' }
  }

  // 1. Fetch collab details
  const { data: collab, error: collabErr } = await supabase
    .from('brand_links')
    .select('*')
    .eq('id', collabId)
    .single()

  if (collabErr || !collab) {
    return { error: 'Collaboration not found' }
  }

  // 2. Check if already tracked in user's campaigns
  const { data: existing } = await supabase
    .from('creator_campaigns')
    .select('id')
    .eq('user_id', user.id)
    .eq('brand_name', collab.brand_name)
    .maybeSingle()

  if (existing) {
    return { success: true, campaignId: existing.id }
  }

  // 3. Insert into creator_campaigns
  const compensation =
    collab.compensation_details || (collab.products_provided ? 'Gifted Product' : 'TBD')
  const deliverables = collab.deliverables || 'UGC Video Deliverable'

  const { data: inserted, error: insertErr } = await supabase
    .from('creator_campaigns')
    .insert({
      user_id: user.id,
      brand_name: collab.brand_name,
      product_name: collab.description || collab.brand_name,
      compensation,
      deliverables,
      deadline: collab.deadline,
      status: 'NEW_PITCH',
      raw_source_text: collab.description || collab.requirements,
      source_type: 'MANUAL',
      source_sender: collab.contact_email || collab.brand_name,
      source_subject: `${collab.brand_name} Brand Collaboration`,
      notes: `Imported from Public Collabs. Application Link: ${collab.application_url}`,
    })
    .select('id')
    .single()

  if (insertErr) {
    console.error('Error tracking collab in CRM:', insertErr)
    return { error: insertErr.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/collabs')
  return { success: true, campaignId: inserted.id }
}


