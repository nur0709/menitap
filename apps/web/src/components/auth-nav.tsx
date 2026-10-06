import Link from 'next/link'
import { getEffectiveUserContext } from '@/features/auth/actions'
import { AuthModalButtons } from '@/features/auth/components/auth-modal-buttons'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserAvatar } from '@/components/user-avatar'
import { ShieldCheck } from 'lucide-react'

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

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {isAdmin && (
        <Link
          href="/dashboard"
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 h-8 rounded-lg text-xs font-semibold bg-foreground text-background hover:opacity-90 transition-opacity"
          title="Admin Command Center"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-[#FC801A]" />
          <span>Admin</span>
        </Link>
      )}
      <Link
        href="/dashboard"
        className="p-0.5 rounded-full hover:ring-2 hover:ring-[#FC801A] transition-all cursor-pointer inline-flex items-center justify-center"
        title="My Account"
        aria-label="My Account"
      >
        <UserAvatar user={{ email, fullName, avatarUrl }} size="md" />
      </Link>
      <ThemeToggle />
    </div>
  )
}
