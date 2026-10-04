import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  href?: string
  className?: string
}

export function BrandLogo({
  size = 'md',
  showText = true,
  href = '/',
  className,
}: BrandLogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  }

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  }

  const content = (
    <div className={cn('inline-flex items-center gap-2.5 group', className)}>
      <div
        className={cn(
          'relative rounded-xl overflow-hidden shadow-sm ring-1 ring-border/50 shrink-0 bg-[#08739C] transition-transform duration-200 group-hover:scale-105',
          iconSizes[size]
        )}
      >
        <Image
          src="/logo.png"
          alt="Menitap logo"
          width={128}
          height={128}
          className="w-full h-full object-cover"
          priority
        />
      </div>
      {showText && (
        <span
          className={cn(
            'font-bold tracking-tight text-foreground transition-colors',
            textSizes[size]
          )}
        >
          <span className="text-[#08739C] dark:text-[#38BDF8]">meni</span>
          <span className="text-[#FC801A]">tap</span>
        </span>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        {content}
      </Link>
    )
  }

  return content
}
