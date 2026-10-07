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

        {/* Step 2: Add Forwarding Address in Gmail */}
        <div className="space-y-2 pt-2 border-t border-border/60">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FC801A] text-white text-[10px] font-bold">
              2
            </span>
            Add a forwarding address in Gmail
          </label>

          <div className="flex items-center gap-2">
            <div className="flex-1 bg-muted/50 border border-border px-3.5 py-2 rounded-xl text-xs text-foreground truncate">
              Click &quot;Add a forwarding address&quot; and paste your deal email
            </div>
            <a
              href="https://mail.google.com/mail/#settings/fwdandpop"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-semibold text-white bg-[#FC801A] hover:bg-[#E66F0D] transition-colors shrink-0 shadow-xs cursor-pointer"
            >
              <span>Open Gmail Settings</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
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
