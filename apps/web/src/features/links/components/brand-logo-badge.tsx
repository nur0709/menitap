'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface BrandLogoBadgeProps {
  brandName: string
  applicationUrl?: string
  imageUrl?: string | null
  className?: string
}

function getBrandInitials(name: string): string {
  if (!name) return 'B'
  const clean = name.trim().replace(/^[^a-zA-Z0-9]+/, '')
  const parts = clean.split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return clean.slice(0, 2).toUpperCase()
}

function getDerivedFaviconUrl(brandName: string, applicationUrl?: string): string | null {
  // If applicationUrl is a direct brand website (not a third-party form)
  if (applicationUrl) {
    try {
      const parsed = new URL(applicationUrl.startsWith('http') ? applicationUrl : `https://${applicationUrl}`)
      const host = parsed.hostname.toLowerCase().replace(/^www\./, '')
      const isThirdPartyForm =
        host.includes('google.com') ||
        host.includes('forms.gle') ||
        host.includes('typeform.com') ||
        host.includes('airtable.com') ||
        host.includes('shopify.com') ||
        host.includes('notion.site')

      if (!isThirdPartyForm && host.includes('.')) {
        return `https://www.google.com/s2/favicons?domain=${host}&sz=128`
      }
    } catch {
      // ignore
    }
  }

  // Derive domain from brand name (e.g. Gymshark -> gymshark.com)
  const cleanName = brandName.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (cleanName.length >= 2) {
    return `https://www.google.com/s2/favicons?domain=${cleanName}.com&sz=128`
  }

  return null
}

export function BrandLogoBadge({
  brandName,
  applicationUrl,
  imageUrl,
  className,
}: BrandLogoBadgeProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const initials = getBrandInitials(brandName)

  // Prioritize explicit imageUrl, then high-res domain favicon
  const potentialSrc = imageUrl || getDerivedFaviconUrl(brandName, applicationUrl)
  const isError = Boolean(potentialSrc && failedUrl === potentialSrc)
  const logoSrc = !isError ? potentialSrc : null

  if (!logoSrc) {
    return (
      <div
        className={cn(
          'relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden shrink-0 border border-[#08739C]/30 bg-gradient-to-br from-[#08739C] to-[#044E6A] text-white font-bold text-xs sm:text-sm flex items-center justify-center select-none shadow-xs',
          className
        )}
        title={brandName}
        aria-hidden="true"
      >
        {initials}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden shrink-0 border border-border/70 bg-card p-1 flex items-center justify-center select-none shadow-2xs group-hover:border-[#08739C]/40 transition-colors',
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoSrc}
        alt={`${brandName} logo`}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setFailedUrl(logoSrc)}
        className="w-full h-full object-contain rounded-lg"
      />
    </div>
  )
}
