import Link from 'next/link'
import { getEffectiveUserContext } from '@/features/auth/actions'
import { getPendingCampaignsCount } from '@/features/links/actions'
import { AuthModalButtons } from '@/features/auth/components/auth-modal-buttons'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserAvatar } from '@/components/user-avatar'

export async function AuthNav() {
  const { user, fullName, avatarUrl, isAdmin } = await getEffectiveUserContext()

  if (!user) {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2">
        <AuthModalButtons />
        <ThemeToggle />
      </div>
    )
  }

  const email = user.email || ''
  const pendingCount = isAdmin ? await getPendingCampaignsCount() : 0
  const hasPending = pendingCount > 0

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Link
        href="/dashboard"
        className="relative p-0.5 rounded-full hover:ring-2 hover:ring-[#FC801A] transition-all cursor-pointer inline-flex items-center justify-center"
        title={hasPending ? `${pendingCount} pending collab(s) need review` : 'My Account'}
        aria-label={hasPending ? `${pendingCount} pending collab(s) need review` : 'My Account'}
      >
        <UserAvatar user={{ email, fullName, avatarUrl }} size="md" />
        {hasPending && (
          <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3 pointer-events-none">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FC801A] opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FC801A] ring-2 ring-background" />
          </span>
        )}
      </Link>
      <ThemeToggle />
    </div>
  )
}
