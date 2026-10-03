'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const AffiliateLinkSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  product_url: z.string().url('Please enter a valid product URL (including https://)'),
  category_id: z.coerce.number().positive('Please select a valid category'),
  discount_percentage: z.coerce.number().min(0).max(100).optional().default(0),
  promo_code: z.string().optional(),
  description: z.string().optional(),
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

  const rawData = {
    title: formData.get('title'),
    product_url: formData.get('product_url'),
    category_id: formData.get('category_id'),
    discount_percentage: formData.get('discount_percentage') || 0,
    promo_code: formData.get('promo_code') || '',
    description: formData.get('description') || '',
  }

  const validation = AffiliateLinkSchema.safeParse(rawData)
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || 'Validation failed' }
  }

  const { error } = await supabase.from('affiliate_links').insert({
    user_id: user.id,
    category_id: validation.data.category_id,
    title: validation.data.title,
    product_url: validation.data.product_url,
    discount_percentage: validation.data.discount_percentage,
    promo_code: validation.data.promo_code || null,
    description: validation.data.description || null,
    status: 'PENDING',
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  redirect('/dashboard?submitted=affiliate')
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

  const { error } = await supabase.from('brand_links').insert({
    user_id: user.id,
    category_id: validation.data.category_id,
    brand_name: validation.data.brand_name,
    application_url: validation.data.application_url,
    description: validation.data.description || null,
    products_provided: validation.data.products_provided,
    status: 'PENDING',
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  redirect('/dashboard?submitted=brand')
}

export async function getCategories() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return data || []
}

export async function getUserLinks() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { affiliateLinks: [], brandLinks: [] }

  const [affiliateRes, brandRes] = await Promise.all([
    supabase
      .from('affiliate_links')
      .select('*, categories(name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('brand_links')
      .select('*, categories(name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  return {
    affiliateLinks: affiliateRes.data || [],
    brandLinks: brandRes.data || [],
  }
}
