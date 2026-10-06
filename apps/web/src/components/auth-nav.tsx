import Link from 'next/link'
import { getEffectiveUserContext } from '@/features/auth/actions'
import { AuthModalButtons } from '@/features/auth/components/auth-modal-buttons'
import { SignOutButton } from '@/features/auth/components/sign-out-button'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserAvatar } from '@/components/user-avatar'

export async function AuthNav() {
  const { user, fullName, avatarUrl } = await getEffectiveUserContext()

  if (!user) {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2">
        <AuthModalButtons />
        <ThemeToggle />
      </div>
    )
  }

  const email = user.email || ''

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <Link
        href="/dashboard"
        className="p-0.5 rounded-full hover:ring-2 hover:ring-[#FC801A] transition-all cursor-pointer inline-flex items-center justify-center"
        title="My Account"
        aria-label="My Account"
      >
        <UserAvatar user={{ email, fullName, avatarUrl }} size="md" />
      </Link>
      <SignOutButton iconOnly />
      <ThemeToggle />
    </div>
  )
}
