'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { triggerGmailSyncAction, disconnectGoogleAction, GoogleIntegrationStatus } from '../actions'
import { formatTimeAgo } from '@/features/campaigns/lib/action-helpers'
import { RefreshCw, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react'

interface GoogleSyncCardProps {
  initialStatus: GoogleIntegrationStatus
}

export function GoogleSyncCard({ initialStatus }: GoogleSyncCardProps) {
  const [status, setStatus] = useState<GoogleIntegrationStatus>(initialStatus)
  const [isPending, startTransition] = useTransition()
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null)

  const handleSync = () => {
    setSyncFeedback(null)
    startTransition(async () => {
      const res = await triggerGmailSyncAction()
      if (res.success) {
        setStatus((prev) => ({
          ...prev,
          lastSyncedAt: new Date().toISOString(),
        }))
        setSyncFeedback(
          res.newDealsCount > 0
            ? `Found ${res.newDealsCount} new deal${res.newDealsCount > 1 ? 's' : ''}!`
            : 'Inbox is up to date (0 new deals)'
        )
      } else {
        setSyncFeedback(res.error || 'Failed to sync')
      }
      setTimeout(() => setSyncFeedback(null), 4000)
    })
  }

  const handleDisconnect = () => {
    if (confirm('Disconnect your Gmail account from Menitap?')) {
      startTransition(async () => {
        const res = await disconnectGoogleAction()
        if (res.success) {
          setStatus({ isConnected: false, emailAddress: null, lastSyncedAt: null })
        }
      })
    }
  }

  if (status.isConnected) {
    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-foreground">Gmail Connected</span>
              <span className="font-mono text-muted-foreground truncate max-w-[220px]">
                {status.emailAddress}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground/80 mt-0.5">
              <span>Auto-syncing brand collaboration pitches</span>
              {status.lastSyncedAt && (
                <>
                  <span>•</span>
                  <span>Last checked {formatTimeAgo(status.lastSyncedAt)}</span>
                </>
              )}
              {syncFeedback && (
                <>
                  <span>•</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    {syncFeedback}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleSync}
            disabled={isPending}
            className="h-8 px-3 rounded-xl text-xs gap-1.5 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`h-3 w-3 ${isPending ? 'animate-spin' : ''}`} />
            <span>{isPending ? 'Syncing...' : 'Sync Now'}</span>
          </Button>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleDisconnect}
            disabled={isPending}
            className="h-8 px-2.5 rounded-xl text-xs text-muted-foreground hover:text-destructive cursor-pointer"
          >
            Disconnect
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-card via-card to-muted/30 border border-border shadow-xs text-left space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#FC801A] animate-ping" />
            <h3 className="text-sm sm:text-base font-bold text-foreground">
              Sync Brand Deals Automatically
            </h3>
          </div>
          <p className="text-xs text-muted-foreground max-w-xl">
            Connect your Gmail to detect brand collaboration pitches, PR gifting packages, and TikTok/Instagram campaigns in real time. 100% passive, zero manual forwarding.
          </p>
        </div>

        <a
          href="/api/auth/google/connect"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#FC801A] hover:bg-[#E66F0D] transition-colors shadow-xs shrink-0 cursor-pointer"
        >
          <span>Connect Gmail Account</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="pt-3 border-t border-border/60 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>Read-only access. Your personal emails, receipts, and private messages are never touched.</span>
      </div>
    </div>
  )
}
