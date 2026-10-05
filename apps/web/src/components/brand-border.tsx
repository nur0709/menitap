import React from 'react'
import { cn } from '@/lib/utils'

interface BrandBorderProps {
  position?: 'top' | 'bottom'
  flip?: boolean
  className?: string
  height?: string
}

export function BrandBorder({
  position = 'top',
  flip = false,
  className,
  height = 'h-7 sm:h-9',
}: BrandBorderProps) {
  const shouldFlip = flip || position === 'bottom'

  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={cn(
        'w-full overflow-hidden select-none relative',
        height,
        shouldFlip && 'rotate-180',
        className
      )}
    >
      {/* Light mode repeating pattern */}
      <div
        className="dark:hidden absolute inset-0 w-full h-full bg-repeat-x bg-[length:auto_100%] bg-top"
        style={{
          backgroundImage: "url('/border-pattern.png')",
        }}
      />
      {/* Dark mode repeating pattern with transparent sky */}
      <div
        className="hidden dark:block absolute inset-0 w-full h-full bg-repeat-x bg-[length:auto_100%] bg-top filter drop-shadow-[0_0_8px_rgba(2,132,199,0.25)]"
        style={{
          backgroundImage: "url('/border-pattern-transparent.png')",
        }}
      />
    </div>
  )
}
