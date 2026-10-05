'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const AffiliateLinkSchema = z.object({
  product_url: z.string().url('Please enter a valid product / affiliate URL (e.g. https://...)'),
  promo_code: z.string().optional().default(''),
  category_id: z.coerce.number().positive('Please select a category'),
  title: z.string().optional().default(''),
})

const BrandLinkSchema = z.object({
  brand_name: z.string().min(2, 'Brand name must be at least 2 characters'),
  application_url: z.string().url('Please enter a valid brand application or collab URL (including https://)'),
  category_id: z.coerce.number().positive('Please select a valid category'),
  description: z.string().optional(),
  products_provided: z.preprocess((val) => val === 'on' || val === true || val === 'true', z.boolean()),
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
    status: 'ACTIVE', // Automatically active for creators
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/for-shoppers')
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
    status: 'ACTIVE',
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/for-creators')
  revalidatePath('/dashboard')
  return { success: 'Campaign link posted successfully!' }
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
    return { error: 'You must be signed in to delete a link.' }
  }

  const { error } = await supabase
    .from('affiliate_links')
    .delete()
    .eq('id', linkId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/for-shoppers')
  revalidatePath('/dashboard')
  return { success: 'Affiliate link removed.' }
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
    .select('id, title, product_url, promo_code, click_count, created_at, category_id, categories(name, slug), profiles(full_name)')
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

export async function getCampaignLinks(categoryId?: number) {
  const supabase = await createClient()

  let query = supabase
    .from('brand_links')
    .select('id, brand_name, application_url, description, products_provided, click_count, created_at, category_id, categories(name, slug), profiles(full_name)')
    .eq('status', 'ACTIVE')
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

  const { error } = await supabase
    .from('brand_links')
    .delete()
    .eq('id', linkId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/for-creators')
  revalidatePath('/dashboard')
  return { success: 'Campaign removed.' }
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


