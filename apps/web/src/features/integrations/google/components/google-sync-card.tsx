'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { triggerGmailSyncAction, disconnectGoogleAction, GoogleIntegrationStatus } from '../actions'
import { formatTimeAgo } from '@/features/campaigns/lib/action-helpers'
import { GmailLogo } from '@/components/social-icons'
import { RefreshCw, ArrowRight } from 'lucide-react'

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
            : 'Inbox is up to date'
        )
      } else {
        setSyncFeedback(res.error || 'Failed to sync')
      }
      setTimeout(() => setSyncFeedback(null), 3500)
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
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl bg-card border border-border shadow-2xs text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-muted/60 shrink-0">
            <GmailLogo className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="font-bold text-foreground">Gmail Synced</span>
            <span className="font-mono text-muted-foreground text-[11px] truncate max-w-[220px]">
              {status.emailAddress}
            </span>
            {status.lastSyncedAt && (
              <span className="text-[11px] text-muted-foreground/70 hidden sm:inline">
                • Checked {formatTimeAgo(status.lastSyncedAt)}
              </span>
            )}
            {syncFeedback && (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold animate-in fade-in">
                • {syncFeedback}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-auto sm:ml-0">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleSync}
            disabled={isPending}
            className="h-7 px-2.5 rounded-lg text-xs gap-1.5 cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`h-3 w-3 ${isPending ? 'animate-spin' : ''}`} />
            <span>{isPending ? 'Syncing...' : 'Sync Now'}</span>
          </Button>

          <button
            type="button"
            onClick={handleDisconnect}
            disabled={isPending}
            className="text-[11px] text-muted-foreground/70 hover:text-destructive px-2 py-1 cursor-pointer transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:px-4 rounded-xl bg-card border border-border shadow-2xs text-xs">
      <div className="flex items-center gap-3">
        <div className="p-1.5 rounded-lg bg-muted/60 shrink-0">
          <GmailLogo className="h-5 w-5" />
        </div>
        <div>
          <span className="font-bold text-foreground">Auto-Sync Brand Deals</span>
          <span className="text-muted-foreground text-[11px] block sm:inline sm:ml-2">
            Connect Gmail to auto-detect brand pitches & PR packages. Read-only.
          </span>
        </div>
      </div>

      <a
        href="/api/auth/google/connect"
        className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#FC801A] hover:bg-[#E66F0D] transition-colors shadow-2xs shrink-0 cursor-pointer self-start sm:self-auto"
      >
        <GmailLogo className="h-3.5 w-3.5 shrink-0" />
        <span>Connect Gmail</span>
        <ArrowRight className="h-3 w-3" />
      </a>
    </div>
  )
}
