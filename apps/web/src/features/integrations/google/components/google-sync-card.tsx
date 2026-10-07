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
      {/* 1. Gmail Button (Completely standalone button) */}
      <div className="relative group flex items-center">
        {status.isConnected ? (
          <button
            type="button"
            onClick={handleDisconnect}
            disabled={isPending}
            className="relative h-10 w-10 rounded-2xl border border-border bg-card hover:bg-muted/70 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-2xs focus-visible:outline-none"
            aria-label={`Gmail connected (${status.emailAddress})`}
          >
            <GmailLogo className="h-6 w-6 shrink-0" />
            {/* Pulsing Connected Emerald Dot */}
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-background" />
            </span>
          </button>
        ) : (
          <a
            href="/api/auth/google/connect"
            className="relative h-10 w-10 rounded-2xl border border-border bg-card hover:bg-muted/70 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-2xs focus-visible:outline-none"
            aria-label="Connect Gmail"
          >
            <GmailLogo className="h-6 w-6 shrink-0" />
            {/* Gray Unlinked Dot */}
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-500 border-2 border-background" />
          </a>
        )}

        {/* Hover Tooltip (Text only shows on hover) */}
        <div className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 flex flex-col items-center min-w-max shadow-lg">
          <div className="w-2 h-2 -mb-1 rotate-45 bg-popover border-t border-l border-border" />
          <div className="bg-popover text-popover-foreground text-xs py-1.5 px-3 rounded-xl border border-border shadow-md space-y-0.5 text-center">
            <div className="font-semibold text-foreground flex items-center justify-center gap-1.5">
              <GmailLogo className="h-3.5 w-3.5" />
              <span>Gmail: {status.isConnected ? 'Connected' : 'Not Connected'}</span>
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

      {/* 2. Outlook Button (Completely standalone button) */}
      <div className="relative group flex items-center">
        <button
          type="button"
          onClick={handleOutlookClick}
          className="relative h-10 w-10 rounded-2xl border border-border bg-card hover:bg-muted/70 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-2xs focus-visible:outline-none"
          aria-label="Outlook (Coming soon)"
        >
          <OutlookLogo className="h-6 w-6 shrink-0" />
          {/* Muted / Coming Soon Dot */}
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-600 border-2 border-background" />
        </button>

        {/* Hover Tooltip */}
        <div className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 flex flex-col items-center min-w-max shadow-lg">
          <div className="w-2 h-2 -mb-1 rotate-45 bg-popover border-t border-l border-border" />
          <div className="bg-popover text-popover-foreground text-xs py-1.5 px-3 rounded-xl border border-border shadow-md space-y-0.5 text-center">
            <div className="font-semibold text-foreground flex items-center justify-center gap-1.5">
              <OutlookLogo className="h-3.5 w-3.5" />
              <span>Outlook: Coming Soon</span>
            </div>
            <div className="text-[11px] text-muted-foreground">
              Auto-sync for Microsoft Outlook
            </div>
          </div>
        </div>
      </div>

      {/* 3. Sync Action Button (Completely standalone button) */}
      <div className="relative group flex items-center">
        {status.isConnected ? (
          <button
            type="button"
            onClick={handleSync}
            disabled={isPending}
            className={`h-10 px-3.5 rounded-2xl border border-border bg-card hover:bg-muted/70 active:scale-95 transition-all flex items-center gap-2 text-xs font-semibold shadow-2xs focus-visible:outline-none ${
              isPending ? 'cursor-wait text-muted-foreground' : 'cursor-pointer text-foreground'
            }`}
            aria-label="Sync Deals"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                isPending
                  ? 'animate-spin text-[#FC801A]'
                  : 'text-[#FC801A]'
              }`}
            />
            <span className="hidden sm:inline">Sync</span>
          </button>
        ) : (
          <a
            href="/api/auth/google/connect"
            className="h-10 px-3.5 rounded-2xl border border-border bg-card hover:bg-muted/70 active:scale-95 transition-all flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground shadow-2xs focus-visible:outline-none cursor-pointer"
            aria-label="Connect Gmail to Sync"
          >
            <RefreshCw className="h-4 w-4 text-muted-foreground/60" />
            <span className="hidden sm:inline">Sync</span>
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
