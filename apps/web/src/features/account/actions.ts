'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type UpgradeState = {
  error?: string
  success?: string
}

export type UpgradePlan = 'BASIC' | 'STANDARD'

export async function upgradeToCreator(plan: UpgradePlan = 'BASIC'): Promise<UpgradeState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in to upgrade.' }
  }

  // Check current profile role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const currentRole = (profile?.role || 'USER').toUpperCase()

  // Only allow upgrading from Free Consumer account (USER)
  if (currentRole === 'BRAND') {
    return { error: 'Brand accounts cannot be converted to Creator accounts.' }
  }

  if (currentRole === 'CREATOR' || currentRole === 'ADMIN') {
    // If downgrading from STANDARD to BASIC, disable public profile
    if (plan === 'BASIC') {
      await supabase
        .from('profiles')
        .update({ is_public_profile: false, updated_at: new Date().toISOString() })
        .eq('id', user.id)
    }

    // If already CREATOR or ADMIN, upgrade or switch subscription plan without losing admin privileges
    const { error: subError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        plan: plan,
        status: 'ACTIVE',
      }, { onConflict: 'user_id' })

    if (subError) {
      return { error: subError.message }
    }

    revalidatePath('/dashboard')
    revalidatePath('/for-brands')
    revalidatePath('/', 'layout')
    return {
      success:
        plan === 'STANDARD'
          ? 'Switched to Creator Standard ($15/mo)!'
          : 'Switched to Creator Basic ($10/mo)! Public profile disabled.',
    }
  }

  // Update profile role to CREATOR (for normal users)
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: 'CREATOR' })
    .eq('id', user.id)

  if (profileError) {
    return { error: profileError.message }
  }

  // Update auth metadata
  await supabase.auth.updateUser({
    data: { role: 'CREATOR' },
  })

  // Update or insert subscription plan (BASIC: $10/mo, STANDARD: $15/mo)
  const subscriptionPlan = plan === 'STANDARD' ? 'STANDARD' : 'BASIC'
  await supabase
    .from('subscriptions')
    .upsert({
      user_id: user.id,
      plan: subscriptionPlan,
      status: 'ACTIVE',
    }, { onConflict: 'user_id' })

  revalidatePath('/dashboard')
  revalidatePath('/', 'layout')

  return { success: `Your account has been switched to Creator (${plan === 'STANDARD' ? '$15/mo Standard' : '$10/mo Basic'})!` }
}

export async function downgradeToConsumer(): Promise<UpgradeState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in to change account type.' }
  }

  // Check current profile role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const currentRole = (profile?.role || 'USER').toUpperCase()

  if (currentRole !== 'CREATOR' && currentRole !== 'ADMIN') {
    return { error: 'Only Creator accounts can be switched back to Consumer.' }
  }

  // Disable public profile and revert role for normal Creator
  if (currentRole !== 'ADMIN') {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: 'USER', is_public_profile: false, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    if (profileError) {
      return { error: profileError.message }
    }

    // Update auth metadata
    await supabase.auth.updateUser({
      data: { role: 'USER' },
    })
  } else {
    // If admin is canceling simulation / creator subscription, also ensure public profile is turned off
    await supabase
      .from('profiles')
      .update({ is_public_profile: false, updated_at: new Date().toISOString() })
      .eq('id', user.id)
  }

  // Revert subscription plan to FREE (canceled creator subscription)
  await supabase
    .from('subscriptions')
    .upsert({
      user_id: user.id,
      plan: 'FREE',
      status: 'ACTIVE',
    }, { onConflict: 'user_id' })

  revalidatePath('/dashboard')
  revalidatePath('/for-brands')
  revalidatePath('/', 'layout')

  return { success: 'Your Creator subscription has been canceled and switched to a Free Consumer account.' }
}

export type DeleteAccountState = {
  error?: string
  success?: string
}

export async function deleteUserAccount(): Promise<DeleteAccountState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in to delete your account.' }
  }

  // Prevent Admins from deleting master admin account
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'ADMIN') {
    return { error: 'Admin accounts cannot be deleted from the user dashboard.' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: rpcError } = await (supabase as any).rpc('request_account_deletion')
  if (rpcError) {
    return { error: rpcError.message }
  }

  // Sign out user session
  await supabase.auth.signOut()

  revalidatePath('/', 'layout')
  return { success: 'Your account has been deleted.' }
}

export async function adminSwitchMode(targetMode: 'USER' | 'CREATOR_BASIC' | 'CREATOR_STANDARD' | 'BRAND' | 'ADMIN'): Promise<{ error?: string; success?: string }> {
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

  const trueRole = (profile?.role || user.user_metadata?.role || '').toUpperCase()
  if (trueRole !== 'ADMIN') {
    return { error: 'Only admins can switch account viewing modes.' }
  }

  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()

  if (targetMode === 'ADMIN') {
    cookieStore.delete('admin_view_mode')
  } else {
    cookieStore.set('admin_view_mode', targetMode, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      sameSite: 'lax',
    })
  }

  revalidatePath('/', 'layout')
  return { success: `Switched view mode to ${targetMode}.` }
}

export async function setPublicProfileVisibility(enabled: boolean): Promise<{ error?: string; success?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in.' }
  }

  // Verify user is Standard Creator or Admin
  const [{ data: profile }, { data: subscription }] = await Promise.all([
    supabase.from('profiles').select('role, instagram_url, tiktok_url, youtube_url').eq('id', user.id).single(),
    supabase.from('subscriptions').select('plan').eq('user_id', user.id).single(),
  ])

  const role = (profile?.role || '').toUpperCase()
  const plan = subscription?.plan || ''
  const isEligible = (role === 'CREATOR' && plan === 'STANDARD') || role === 'ADMIN'

  if (!isEligible) {
    return { error: 'Only Creator Standard members can manage a public portfolio profile.' }
  }

  // If enabling, verify creator has at least one social media link saved
  if (enabled) {
    const hasAnyLink = Boolean(
      profile?.instagram_url?.trim() ||
      profile?.tiktok_url?.trim() ||
      profile?.youtube_url?.trim()
    )
    if (!hasAnyLink) {
      return { error: 'Please save at least one social media link before enabling your public profile.' }
    }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      is_public_profile: enabled,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/for-brands')
  return { success: enabled ? 'Public profile is now active!' : 'Public profile is now hidden.' }
}

export async function updateCreatorLinks(formData: FormData): Promise<{ error?: string; success?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in.' }
  }

  // Verify user is Standard Creator or Admin
  const [{ data: profile }, { data: subscription }] = await Promise.all([
    supabase.from('profiles').select('role, is_public_profile').eq('id', user.id).single(),
    supabase.from('subscriptions').select('plan').eq('user_id', user.id).single(),
  ])

  const role = (profile?.role || '').toUpperCase()
  const plan = subscription?.plan || ''
  const isEligible = (role === 'CREATOR' && plan === 'STANDARD') || role === 'ADMIN'

  if (!isEligible) {
    return { error: 'Only Creator Standard members can manage a public portfolio profile.' }
  }

  const instagram = ((formData.get('instagram_url') as string) || '').trim()
  const tiktok = ((formData.get('tiktok_url') as string) || '').trim()
  const youtube = ((formData.get('youtube_url') as string) || '').trim()
  const bio = ((formData.get('bio') as string) || '').trim()

  const isPublic = Boolean(profile?.is_public_profile)

  // If public profile is currently enabled, creator MUST retain at least one social media link
  if (isPublic && !instagram && !tiktok && !youtube) {
    return {
      error: 'Your public profile is currently active. You must keep at least one social media link, or disable your public profile before removing all links.',
    }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      is_public_profile: isPublic,
      instagram_url: instagram,
      tiktok_url: tiktok,
      youtube_url: youtube,
      bio: bio,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/for-brands')
  return { success: 'Links & portfolio saved successfully!' }
}

// Keep updatePublicProfile for backwards compatibility
export async function updatePublicProfile(formData: FormData) {
  return updateCreatorLinks(formData)
}

