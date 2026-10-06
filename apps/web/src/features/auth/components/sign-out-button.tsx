'use client'

import { useTransition } from 'react'
import { signOut } from '@/features/auth/actions'
import { LogOut, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SignOutButtonProps {
  className?: string
  iconOnly?: boolean
  variant?: 'nav' | 'drawer' | 'account'
}

export function SignOutButton({ className, iconOnly = false, variant = 'nav' }: SignOutButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut()
    })
  }

  if (variant === 'drawer') {
    return (
      <button
        type="button"
        onClick={handleSignOut}
        disabled={isPending}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors w-full cursor-pointer',
          className
        )}
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> : <LogOut className="h-4 w-4 shrink-0" />}
        <span>{isPending ? 'Signing out...' : 'Sign Out'}</span>
      </button>
    )
  }

  if (variant === 'account') {
    return (
      <button
        type="button"
        onClick={handleSignOut}
        disabled={isPending}
        className={cn(
          'inline-flex items-center gap-1.5 px-4 h-9 rounded-lg border border-border hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer',
          className
        )}
      >
        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
        <span>{isPending ? 'Signing out...' : 'Sign Out'}</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isPending}
      title="Sign Out"
      className={cn(
        'inline-flex items-center gap-1.5 p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer text-xs font-medium',
        className
      )}
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
      {!iconOnly && <span className="hidden lg:inline">{isPending ? '...' : 'Sign Out'}</span>}
    </button>
  )
}
