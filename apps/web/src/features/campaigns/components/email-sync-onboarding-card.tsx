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
      <CardContent className="p-5 sm:p-7 space-y-6">
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

        {/* Step 2: Realistic Gmail Settings View (Matching User Screenshot) */}
        <div className="space-y-3 pt-2 border-t border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#08739C] text-white text-[10px] font-bold">
                2
              </span>
              Paste in Gmail &gt; Forwarding
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

          {/* Authentic Gmail Settings Screenshot Replica */}
          <div className="rounded-xl border border-border bg-[#F8FAFC] dark:bg-muted/30 p-3.5 sm:p-5 shadow-xs text-left overflow-x-auto text-[11px] sm:text-xs text-foreground font-sans">
            {/* Top Tabs replica */}
            <div className="flex items-center gap-3 sm:gap-4 border-b border-border/70 pb-2 mb-3 text-muted-foreground text-[11px] whitespace-nowrap overflow-x-auto scrollbar-none">
              <span>Filters and Blocked Addresses</span>
              <span className="text-[#1A73E8] dark:text-[#38BDF8] font-bold border-b-2 border-[#1A73E8] dark:border-[#38BDF8] pb-2 -mb-2">
                Forwarding and POP/IMAP
              </span>
              <span>Add-ons</span>
            </div>

            {/* Forwarding Row */}
            <div className="grid grid-cols-[auto_1fr] gap-3 sm:gap-5 items-start py-2">
              <span className="font-bold text-foreground shrink-0 pt-0.5">
                Forwarding:
              </span>

              <div className="space-y-2.5">
                {/* Disabled option */}
                <div className="flex items-center gap-2 text-muted-foreground text-xs opacity-60">
                  <span className="h-3.5 w-3.5 rounded-full border border-border inline-block" />
                  <span>Disable forwarding</span>
                </div>

                {/* Active Forward option */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-foreground">
                  <span className="h-3.5 w-3.5 rounded-full border-4 border-[#1A73E8] bg-white inline-block shrink-0" />
                  <span>Forward a copy of incoming mail to</span>

                  {/* Input Box with Pasted Address */}
                  <div className="bg-background border-2 border-blue-500 rounded px-2.5 py-1 font-mono text-[11px] text-blue-600 dark:text-blue-400 font-semibold shadow-xs flex items-center gap-1.5">
                    <span>{forwardAddress}</span>
                    <span className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1 rounded font-sans font-bold">
                      Pasted ✓
                    </span>
                  </div>

                  <span>and</span>

                  {/* Keep in Inbox dropdown */}
                  <div className="bg-background border border-border rounded px-2 py-1 text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                    <span>keep Gmail&apos;s copy in the Inbox</span>
                    <span className="text-[9px]">▾</span>
                  </div>
                </div>

                {/* Subtext */}
                <p className="text-[10px] sm:text-[11px] text-muted-foreground/80 pl-5">
                  Tip: You can forward specific messages using filters
                </p>
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
