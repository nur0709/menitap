'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { syncUserGmailCampaigns, SyncResult } from './gmail-sync'

export interface GoogleIntegrationStatus {
  isConnected: boolean
  emailAddress: string | null
  lastSyncedAt: string | null
}

export async function getGoogleIntegration(): Promise<GoogleIntegrationStatus> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { isConnected: false, emailAddress: null, lastSyncedAt: null }
  }

  const { data: integration, error } = await supabase
    .from('user_email_integrations')
    .select('email_address, last_synced_at')
    .eq('user_id', user.id)
    .eq('provider', 'google')
    .single()

  if (error || !integration) {
    return { isConnected: false, emailAddress: null, lastSyncedAt: null }
  }

  return {
    isConnected: true,
    emailAddress: integration.email_address,
    lastSyncedAt: integration.last_synced_at,
  }
}

export async function triggerGmailSyncAction(): Promise<SyncResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      newDealsCount: 0,
      updatedDealsCount: 0,
      totalScanned: 0,
      error: 'Not authenticated',
    }
  }

  const result = await syncUserGmailCampaigns(user.id)
  revalidatePath('/dashboard')
  return result
}

export async function disconnectGoogleAction(): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('user_email_integrations')
    .delete()
    .eq('user_id', user.id)
    .eq('provider', 'google')

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
