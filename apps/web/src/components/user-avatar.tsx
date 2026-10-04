import Image from 'next/image'
import { cn } from '@/lib/utils'

interface UserAvatarProps {
  user: {
    email?: string | null
    fullName?: string | null
    avatarUrl?: string | null
  }
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

function getInitials(name?: string | null, email?: string | null): string {
  if (name && name.trim().length > 0) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return parts[0].slice(0, 2).toUpperCase()
  }
  if (email && email.trim().length > 0) {
    return email.trim().slice(0, 2).toUpperCase()
  }
  return 'U'
}

export function UserAvatar({ user, size = 'md', className }: UserAvatarProps) {
  const initials = getInitials(user.fullName, user.email)
  const avatarUrl = user.avatarUrl

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-9 w-9 text-sm',
    lg: 'h-16 w-16 text-xl',
  }[size]

  if (avatarUrl) {
    return (
      <div
        className={cn(
          'relative rounded-full overflow-hidden border border-border shrink-0 bg-muted select-none',
          sizeClasses,
          className
        )}
      >
        <Image
          src={avatarUrl}
          alt={user.fullName || user.email || 'User'}
          fill
          sizes={size === 'lg' ? '64px' : '36px'}
          className="object-cover"
          unoptimized
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold shrink-0 bg-[#08739C] text-white border border-[#08739C]/40 select-none shadow-xs',
        sizeClasses,
        className
      )}
      title={user.fullName || user.email || 'User'}
    >
      {initials}
    </div>
  )
}
