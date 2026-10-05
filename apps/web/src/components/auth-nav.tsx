import Link from 'next/link'
import { getEffectiveUserContext } from '@/features/auth/actions'
import { buttonVariants } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserAvatar } from '@/components/user-avatar'
import { cn } from '@/lib/utils'

export async function AuthNav() {
  const { user, fullName, avatarUrl } = await getEffectiveUserContext()

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

  const email = user.email || ''

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
