'use client'

import { useState } from 'react'
import { Tag } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DealThumbnailProps {
  imageUrl?: string | null
  title: string
  className?: string
}

export function DealThumbnail({ imageUrl, title, className }: DealThumbnailProps) {
  const [error, setError] = useState(false)

  if (!imageUrl || error) {
    return (
      <div
        className={cn(
          'relative w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden shrink-0 border border-border/70 bg-gradient-to-br from-[#08739C]/10 via-muted to-muted/40 flex items-center justify-center select-none shadow-2xs',
          className
        )}
        aria-hidden="true"
      >
        <Tag className="h-6 w-6 text-[#08739C] dark:text-[#38BDF8] opacity-80" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden shrink-0 border border-border/70 bg-muted/30 select-none shadow-2xs group-hover:border-[#08739C]/40 transition-colors',
        className
      )}
    >
      {/* Native img with no-referrer to prevent hotlink 403 blocks */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={title}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setError(true)}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </div>
  )
}
