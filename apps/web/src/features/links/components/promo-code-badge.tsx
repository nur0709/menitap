'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Check, Copy } from 'lucide-react'

export function PromoCodeBadge({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback if clipboard permissions denied
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center cursor-pointer group"
      title="Click to copy promo code"
      aria-label={`Copy promo code ${code}`}
    >
      <Badge className="bg-[#FC801A]/10 text-[#FC801A] border-[#FC801A]/30 font-mono text-[11px] font-bold px-2 py-0 flex items-center gap-1 group-hover:bg-[#FC801A]/20 transition-colors">
        {copied ? (
          <>
            <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
            <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
          </>
        ) : (
          <>
            <span>{code}</span>
            <Copy className="h-2.5 w-2.5 opacity-60 group-hover:opacity-100" />
          </>
        )}
      </Badge>
    </button>
  )
}
