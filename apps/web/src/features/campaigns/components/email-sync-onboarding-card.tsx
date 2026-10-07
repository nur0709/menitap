'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Check, ExternalLink, CheckCircle2 } from 'lucide-react'

interface EmailSyncOnboardingCardProps {
  inboundToken: string | null
}

export function EmailSyncOnboardingCard({ inboundToken }: EmailSyncOnboardingCardProps) {
  const [copied, setCopied] = useState(false)

  const forwardAddress = inboundToken
    ? `deals+${inboundToken}@in.menitap.com`
    : 'deals@in.menitap.com'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(forwardAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
    }
  }

  return (
    <Card className="bg-card border-border shadow-xs rounded-2xl overflow-hidden text-left">
      <CardContent className="p-6 sm:p-7 space-y-6">
        {/* Title */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-foreground">
            Automatic Deal Sync
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Forward brand emails to Menitap once, and your deals appear as cards automatically.
          </p>
        </div>

        {/* Step 1: Copy Address */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FC801A] text-white text-[10px] font-bold">
              1
            </span>
            Copy your private deal address
          </label>

          <div className="flex items-center gap-2">
            <div className="flex-1 bg-muted/50 border border-border px-3.5 py-2 rounded-xl font-mono text-xs text-foreground select-all truncate">
              {forwardAddress}
            </div>
            <Button
              type="button"
              size="sm"
              onClick={handleCopy}
              className={`h-9 px-4 rounded-xl text-xs font-semibold cursor-pointer transition-colors shrink-0 ${
                copied
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-[#FC801A] hover:bg-[#E66F0D] text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Step 2: Realistic Gmail Modal Mockup */}
        <div className="space-y-3 pt-2 border-t border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#08739C] text-white text-[10px] font-bold">
                2
              </span>
              Paste into Gmail Forwarding
            </label>

            <a
              href="https://mail.google.com/mail/u/0/#settings/fwdandpop"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#08739C] dark:text-[#38BDF8] hover:underline cursor-pointer"
            >
              <span>Open Gmail Settings</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Authentic Gmail Dialog Screenshot Mockup */}
          <div className="rounded-xl border border-border bg-[#F8FAFC] dark:bg-muted/40 p-4 sm:p-5 shadow-xs max-w-lg mx-auto text-left">
            {/* Gmail Modal Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-2.5 mb-3">
              <span className="text-xs font-semibold text-foreground">
                Add a forwarding address
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">Gmail</span>
            </div>

            {/* Gmail Input Field */}
            <div className="space-y-1.5 mb-4">
              <span className="text-[11px] text-muted-foreground block">
                Please enter a forwarding email address:
              </span>
              <div className="w-full bg-background border border-blue-500 ring-2 ring-blue-500/20 px-3 py-1.5 rounded text-xs font-mono text-foreground flex items-center justify-between">
                <span className="truncate">{forwardAddress}</span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-sans font-medium shrink-0 ml-2">
                  Pasted
                </span>
              </div>
            </div>

            {/* Gmail Modal Buttons */}
            <div className="flex justify-end gap-2 pt-1">
              <div className="px-3 py-1 text-[11px] text-muted-foreground border border-border rounded bg-background">
                Cancel
              </div>
              <div className="px-3 py-1 text-[11px] font-medium text-white bg-[#1A73E8] rounded shadow-xs flex items-center gap-1">
                <span>Next</span>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Auto-verify badge */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Google&apos;s verification is approved automatically. No confirmation codes needed.</span>
        </div>
      </CardContent>
    </Card>
  )
}
