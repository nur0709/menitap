'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type SwitchRoleState = {
  error?: string
  success?: string
}

export async function switchUserRole(
  prevState: SwitchRoleState | null,
  formData: FormData
): Promise<SwitchRoleState> {
  const newRole = formData.get('role') as string

  if (!newRole || !['USER', 'CREATOR', 'BRAND'].includes(newRole)) {
    return { error: 'Invalid account role selected.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in to change account type.' }
  }

  // Update public.profiles
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', user.id)

  if (profileError) {
    return { error: profileError.message }
  }

  // Update raw_user_meta_data in auth
  await supabase.auth.updateUser({
    data: { role: newRole },
  })

  revalidatePath('/dashboard')
  revalidatePath('/', 'layout')

  return { success: `Successfully switched to ${newRole === 'CREATOR' ? 'Creator' : newRole === 'BRAND' ? 'Brand' : 'Shopper'} account!` }
}
