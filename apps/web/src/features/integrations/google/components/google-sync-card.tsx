'use client'

import { useState, useTransition } from 'react'
import {
  triggerGmailSyncAction,
  disconnectGoogleAction,
  GoogleIntegrationStatus,
} from '../actions'
import { formatTimeAgo } from '@/features/campaigns/lib/action-helpers'
import { GmailLogo, OutlookLogo } from '@/components/social-icons'
import { RefreshCw } from 'lucide-react'

interface GoogleSyncCardProps {
  initialStatus: GoogleIntegrationStatus
}

export function GoogleSyncCard({ initialStatus }: GoogleSyncCardProps) {
  const [status, setStatus] = useState<GoogleIntegrationStatus>(initialStatus)
  const [isPending, startTransition] = useTransition()
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null)
  const [outlookFeedback, setOutlookFeedback] = useState<string | null>(null)

  const handleDisconnect = () => {
    if (confirm(`Disconnect Gmail (${status.emailAddress || ''}) from Menitap?`)) {
      startTransition(async () => {
        const res = await disconnectGoogleAction()
        if (res.success) {
          setStatus({ isConnected: false, emailAddress: null, lastSyncedAt: null })
        }
      })
    }
  }

  const handleSync = () => {
    if (!status.isConnected) return

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
            ? `+${res.newDealsCount} deal${res.newDealsCount > 1 ? 's' : ''}`
            : 'Up to date'
        )
      } else {
        setSyncFeedback(res.error || 'Failed to sync')
      }
      setTimeout(() => setSyncFeedback(null), 3500)
    })
  }

  const handleOutlookClick = () => {
    setOutlookFeedback('Outlook coming soon!')
    setTimeout(() => setOutlookFeedback(null), 3000)
  }

  return (
    <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
      {/* 1. Gmail Button (Circular frame indicator) */}
      <div className="relative group flex items-center">
        {status.isConnected ? (
          <button
            type="button"
            onClick={handleDisconnect}
            disabled={isPending}
            className="relative h-10 w-10 rounded-full border-2 border-emerald-500 bg-card hover:bg-emerald-500/10 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-2xs shadow-emerald-500/10 focus-visible:outline-none"
            aria-label={`Gmail connected (${status.emailAddress})`}
          >
            <GmailLogo className="h-6 w-6 shrink-0" />
          </button>
        ) : (
          <a
            href="/api/auth/google/connect"
            className="relative h-10 w-10 rounded-full border-2 border-border/80 dark:border-zinc-700 hover:border-foreground/40 bg-card hover:bg-muted/70 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-2xs focus-visible:outline-none"
            aria-label="Connect Gmail"
          >
            <GmailLogo className="h-6 w-6 shrink-0" />
          </a>
        )}

        {/* Hover Tooltip */}
        <div className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 flex flex-col items-center min-w-max shadow-lg">
          <div className="w-2 h-2 -mb-1 rotate-45 bg-popover border-t border-l border-border" />
          <div className="bg-popover text-popover-foreground text-xs py-1.5 px-3 rounded-xl border border-border shadow-md space-y-0.5 text-center">
            <div className="font-semibold text-foreground flex items-center justify-center gap-1.5">
              <GmailLogo className="h-3.5 w-3.5" />
              <span>Gmail:</span>
              {status.isConnected ? (
                <span className="text-emerald-500 font-bold">Connected</span>
              ) : (
                <span className="text-muted-foreground font-bold">Not Connected</span>
              )}
            </div>
            {status.isConnected ? (
              <>
                <div className="text-[11px] text-muted-foreground font-mono">
                  {status.emailAddress}
                </div>
                <div className="text-[10px] text-muted-foreground/80 pt-0.5">
                  Click to disconnect
                </div>
              </>
            ) : (
              <div className="text-[11px] text-muted-foreground">
                Click to connect & auto-sync brand deals
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Outlook Button (Circular frame indicator) */}
      <div className="relative group flex items-center">
        <button
          type="button"
          onClick={handleOutlookClick}
          className="relative h-10 w-10 rounded-full border-2 border-border/80 dark:border-zinc-700 hover:border-foreground/40 bg-card hover:bg-muted/70 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-2xs focus-visible:outline-none"
          aria-label="Outlook: Not Connected (Coming soon)"
        >
          <OutlookLogo className="h-6 w-6 shrink-0" />
        </button>

        {/* Hover Tooltip */}
        <div className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 flex flex-col items-center min-w-max shadow-lg">
          <div className="w-2 h-2 -mb-1 rotate-45 bg-popover border-t border-l border-border" />
          <div className="bg-popover text-popover-foreground text-xs py-1.5 px-3 rounded-xl border border-border shadow-md space-y-0.5 text-center">
            <div className="font-semibold text-foreground flex items-center justify-center gap-1.5">
              <OutlookLogo className="h-3.5 w-3.5" />
              <span>Outlook:</span>
              <span className="text-muted-foreground font-bold">Not Connected</span>
            </div>
            <div className="text-[11px] text-muted-foreground">
              Auto-sync for Microsoft Outlook (Coming soon)
            </div>
          </div>
        </div>
      </div>

      {/* 3. Sync Action Button (Circular frame) */}
      <div className="relative group flex items-center">
        {status.isConnected ? (
          <button
            type="button"
            onClick={handleSync}
            disabled={isPending}
            className={`relative h-10 w-10 rounded-full border-2 border-border/80 dark:border-zinc-700 hover:border-foreground/40 bg-card hover:bg-muted/70 active:scale-95 transition-all flex items-center justify-center shadow-2xs focus-visible:outline-none ${
              isPending ? 'cursor-wait text-muted-foreground' : 'cursor-pointer text-foreground'
            }`}
            aria-label="Sync Deals"
          >
            <RefreshCw
              className={`h-5 w-5 ${
                isPending
                  ? 'animate-spin text-[#FC801A]'
                  : 'text-[#FC801A]'
              }`}
            />
          </button>
        ) : (
          <a
            href="/api/auth/google/connect"
            className="relative h-10 w-10 rounded-full border-2 border-border/80 dark:border-zinc-700 hover:border-foreground/40 bg-card hover:bg-muted/70 active:scale-95 transition-all flex items-center justify-center text-muted-foreground hover:text-foreground shadow-2xs focus-visible:outline-none cursor-pointer"
            aria-label="Connect Gmail to Sync"
          >
            <RefreshCw className="h-5 w-5 text-muted-foreground/60" />
          </a>
        )}

        {/* Hover Tooltip */}
        <div className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 flex flex-col items-center min-w-max shadow-lg">
          <div className="w-2 h-2 -mb-1 rotate-45 bg-popover border-t border-l border-border" />
          <div className="bg-popover text-popover-foreground text-xs py-1.5 px-3 rounded-xl border border-border shadow-md space-y-0.5 text-center">
            <div className="font-semibold text-foreground">
              {isPending ? 'Syncing...' : 'Sync Inbox'}
            </div>
            {status.isConnected ? (
              <div className="text-[11px] text-muted-foreground">
                {status.lastSyncedAt
                  ? `Checked ${formatTimeAgo(status.lastSyncedAt)}`
                  : 'Click to scan for brand pitches'}
              </div>
            ) : (
              <div className="text-[11px] text-muted-foreground">
                Connect Gmail to auto-sync pitches
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sync / Outlook Feedback Badge */}
      {(syncFeedback || outlookFeedback) && (
        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl animate-in fade-in slide-in-from-left-1 whitespace-nowrap ml-0.5">
          {syncFeedback || outlookFeedback}
        </span>
      )}
    </div>
  )
}
