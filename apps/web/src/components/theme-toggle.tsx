'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme()
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="sm"
        aria-label="Toggle theme"
        className={cn(
          'h-9 w-9 p-0 rounded-full border border-border/40',
          className
        )}
        disabled
      >
        <span className="h-4 w-4" />
      </Button>
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'h-9 w-9 p-0 rounded-full border transition-all cursor-pointer',
        isDark
          ? 'border-amber-400 text-amber-400 hover:bg-amber-400/15 hover:border-amber-400 hover:text-amber-300'
          : 'border-sky-700 text-sky-700 hover:bg-sky-700/10 hover:border-sky-700 hover:text-sky-800',
        className
      )}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-400 transition-transform duration-200 rotate-0 scale-100" />
      ) : (
        <Moon className="h-4 w-4 text-sky-700 transition-transform duration-200 rotate-0 scale-100" />
      )}
    </Button>
  )
}
