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

  if (currentRole === 'CREATOR') {
    // If already CREATOR, upgrade subscription plan if requested
    if (plan === 'STANDARD') {
      await supabase
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          plan: 'STANDARD',
          status: 'ACTIVE',
        }, { onConflict: 'user_id' })

      revalidatePath('/dashboard')
      revalidatePath('/', 'layout')
      return { success: 'Upgraded to Creator Standard ($15/mo)!' }
    }
    return { error: 'Your account is already on this Creator plan.' }
  }

  // Update profile role to CREATOR
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

  if (currentRole !== 'CREATOR') {
    return { error: 'Only Creator accounts can be switched back to Consumer.' }
  }

  // Update profile role to USER
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: 'USER' })
    .eq('id', user.id)

  if (profileError) {
    return { error: profileError.message }
  }

  // Update auth metadata
  await supabase.auth.updateUser({
    data: { role: 'USER' },
  })

  // Revert subscription plan to FREE (canceled creator subscription)
  await supabase
    .from('subscriptions')
    .upsert({
      user_id: user.id,
      plan: 'FREE',
      status: 'ACTIVE',
    }, { onConflict: 'user_id' })

  revalidatePath('/dashboard')
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
