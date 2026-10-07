'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Check, ExternalLink, Mail, Zap, ShieldCheck } from 'lucide-react'

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
    <Card className="bg-card border-border shadow-xs rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-[#08739C]/10 via-[#FC801A]/5 to-transparent border-b border-border p-5 sm:p-6">
        <div className="flex items-center gap-2.5 text-[#08739C] dark:text-[#38BDF8] mb-1">
          <Zap className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Hands-Free Automation</span>
        </div>
        <h3 className="text-base sm:text-lg font-bold text-foreground">
          24/7 Email Deal Sync (30-Second Setup)
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Never re-type a brand deal again. Auto-forward brand emails once, and deals appear as cards automatically.
        </p>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-5">
        {/* Step 1: Copy Forwarding Address */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FC801A] text-white text-[10px] font-bold">
                1
              </span>
              Copy your private Menitap deal address
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-muted/60 border border-border px-3.5 py-2.5 rounded-xl font-mono text-xs text-foreground select-all break-all flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span>{forwardAddress}</span>
            </div>
            <Button
              type="button"
              onClick={handleCopy}
              className={`h-9 px-4 rounded-xl text-xs font-semibold shrink-0 cursor-pointer transition-colors ${
                copied
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-[#FC801A] hover:bg-[#E66F0D] text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Copied!
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

        {/* Step 2: Open Gmail Settings */}
        <div className="space-y-2 pt-1 border-t border-border/60">
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#08739C] text-white text-[10px] font-bold">
              2
            </span>
            Add it to your Gmail Forwarding
          </span>
          <p className="text-xs text-muted-foreground">
            Click the button below to jump straight to the exact Forwarding page in your Gmail:
          </p>
          <a
            href="https://mail.google.com/mail/u/0/#settings/fwdandpop"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-muted hover:bg-muted/80 text-foreground font-medium text-xs px-4 py-2 rounded-xl border border-border transition-colors cursor-pointer"
          >
            <span>Open Gmail Forwarding Settings</span>
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
          </a>
        </div>

        {/* Step 3: Explanation & Auto-verify */}
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>Automatic Instant Verification</span>
          </div>
          <p className="text-[11px] leading-relaxed text-emerald-700 dark:text-emerald-400">
            When Gmail sends a confirmation link to verify your forwarding address, Menitap automatically detects and approves it for you in the background!
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
