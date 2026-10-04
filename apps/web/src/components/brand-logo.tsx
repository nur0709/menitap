import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  href?: string
  className?: string
  priority?: boolean
}

export function BrandLogo({
  size = 'md',
  href = '/',
  className,
  priority = true,
}: BrandLogoProps) {
  const sizeClasses = {
    sm: 'w-10 h-10 sm:w-11 sm:h-11',
    md: 'w-12 h-12 sm:w-14 sm:h-14',
    lg: 'w-20 h-20 sm:w-24 sm:h-24',
    xl: 'w-28 h-28 sm:w-32 sm:h-32',
  }

  const content = (
    <div
      className={cn(
        'relative shrink-0 rounded-2xl overflow-hidden shadow-md shadow-[#08739C]/15 transition-transform duration-200 hover:scale-105 active:scale-95 group',
        sizeClasses[size],
        className
      )}
    >
      <Image
        src="/logo.png"
        alt="Menitap"
        width={256}
        height={256}
        className="w-full h-full object-contain"
        priority={priority}
      />
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center" aria-label="Menitap Home">
        {content}
      </Link>
    )
  }

  return content
}
