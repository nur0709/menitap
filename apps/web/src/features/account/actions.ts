'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type UpgradeState = {
  error?: string
  success?: string
}

export async function upgradeToCreator(): Promise<UpgradeState> {
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
    return { error: 'Your account is already a Creator account.' }
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

  // Update or insert subscription plan to CREATOR_TRIAL
  await supabase
    .from('subscriptions')
    .upsert({
      user_id: user.id,
      plan: 'CREATOR_TRIAL',
      status: 'ACTIVE',
    }, { onConflict: 'user_id' })

  revalidatePath('/dashboard')
  revalidatePath('/', 'layout')

  return { success: 'Your account has been switched to Creator! Welcome aboard.' }
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
