import Link from 'next/link'
import { getCurrentUser } from '@/features/auth/actions'
import { createClient } from '@/lib/supabase/server'
import { buttonVariants } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserAvatar } from '@/components/user-avatar'
import { cn } from '@/lib/utils'

export async function AuthNav() {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/sign-in"
          className={cn(
            buttonVariants(),
            'bg-[#FC801A] hover:bg-[#E66F0D] text-white shadow-sm font-medium transition-all px-4 sm:px-5'
          )}
        >
          Sign In
        </Link>
        <ThemeToggle />
      </div>
    )
  }

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single()

  const email = user.email || ''
  const fullName = profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || ''
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture || null

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[#FC801A] transition-all cursor-pointer group"
        title="My Account"
      >
        <UserAvatar user={{ email, fullName, avatarUrl }} size="md" />
        <span className="hidden sm:inline text-xs font-semibold text-foreground group-hover:text-[#FC801A] transition-colors pr-1">
          My Account
        </span>
      </Link>
      <ThemeToggle />
    </div>
  )
}
