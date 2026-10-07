'use client'

import { useState, useTransition } from 'react'
import { CreatorCampaign, CampaignStatus } from '../types'
import { updateCampaignStatus, deleteCampaign } from '../actions'
import { CampaignDetailsModal } from './campaign-details-modal'
import {
  DollarSign,
  Calendar,
  Package,
  Trash2,
  ChevronDown,
  Loader2,
  AlertCircle,
  Clock,
} from 'lucide-react'

interface CampaignCardProps {
  campaign: CreatorCampaign
}

// User requested to remove "New Pitch" and "Filming" from the status toggle options
const SELECTABLE_STATUSES: { value: CampaignStatus; label: string }[] = [
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'PAID', label: 'Paid ✓' },
  { value: 'DECLINED', label: 'Declined' },
]

const STATUS_BADGE_CLASS: Record<CampaignStatus, string> = {
  NEW_PITCH: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  ACCEPTED: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
  FILMING: 'bg-[#FC801A]/10 text-[#FC801A] border-[#FC801A]/30',
  DELIVERED: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  PAID: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  DECLINED: 'bg-muted text-muted-foreground border-border',
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [currentStatus, setCurrentStatus] = useState<CampaignStatus>(campaign.status)

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = e.target.value as CampaignStatus
    setCurrentStatus(nextStatus)
    startTransition(async () => {
      await updateCampaignStatus(campaign.id, nextStatus)
    })
  }

  const handleDelete = () => {
    if (confirm(`Delete ${campaign.brand_name} deal card?`)) {
      startTransition(async () => {
        await deleteCampaign(campaign.id)
      })
    }
  }

  // Highlighted Due Date badge
  const renderHighlightedDeadline = () => {
    if (!campaign.deadline) return null
    const due = new Date(campaign.deadline)
    const now = new Date()
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const formattedDate = due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

    if (diffDays < 0) {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/25 shadow-xs">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>Overdue: {formattedDate}</span>
        </div>
      )
    }
    if (diffDays === 0) {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-[#FC801A] bg-[#FC801A]/10 border border-[#FC801A]/30 shadow-xs">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span>Due Today!</span>
        </div>
      )
    }
    if (diffDays <= 4) {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 border border-amber-500/30 shadow-xs">
          <Calendar className="h-3.5 w-3.5 text-amber-600 shrink-0" />
          <span>Due {formattedDate} ({diffDays}d left)</span>
        </div>
      )
    }
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-foreground bg-muted/60 border border-border">
        <Calendar className="h-3.5 w-3.5 text-[#08739C] dark:text-[#38BDF8] shrink-0" />
        <span>Due: {formattedDate}</span>
      </div>
    )
  }

  const isNew = currentStatus === 'NEW_PITCH'
  const badgeClass =
    currentStatus === 'NEW_PITCH'
      ? 'bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground border-border'
      : STATUS_BADGE_CLASS[currentStatus] || STATUS_BADGE_CLASS.DECLINED

  return (
    <>
      <div
        className={`relative rounded-2xl bg-card border p-4 sm:p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between ${
          isNew
            ? 'border-emerald-500/30 border-l-[3.5px] border-l-emerald-500 dark:border-l-emerald-400'
            : 'border-border'
        }`}
      >
        <div>
          {/* Top: Brand & Product header + NEW indicator badge */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              {campaign.brand_logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={campaign.brand_logo_url}
                  alt={campaign.brand_name}
                  className="h-10 w-10 rounded-xl object-contain bg-background border border-border p-1 shrink-0"
                />
              ) : (
                <div className="h-10 w-10 rounded-xl bg-[#FC801A]/10 text-[#FC801A] font-bold flex items-center justify-center text-xs border border-[#FC801A]/20 shrink-0">
                  {campaign.brand_name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-foreground truncate">{campaign.brand_name}</h4>
                {campaign.product_name ? (
                  <p className="text-xs text-muted-foreground font-medium leading-snug line-clamp-2 mt-0.5">
                    {campaign.product_name}
                  </p>
                ) : (
                  <p className="text-[11px] text-muted-foreground/80 mt-0.5">Brand Collaboration</p>
                )}
              </div>
            </div>

            {/* Prominent Indicator for Newly Posted Cards */}
            {isNew && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shadow-xs shrink-0 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                New
              </span>
            )}
          </div>

          {/* Key Metrics: Compensation & Highlighted Due Date */}
          <div className="space-y-2.5 my-3 pt-2.5 border-t border-border/60">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {campaign.compensation && (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1 shadow-xs">
                  <DollarSign className="h-3.5 w-3.5" />
                  {campaign.compensation}
                </span>
              )}
              {renderHighlightedDeadline()}
            </div>

            {/* Deliverables */}
            {campaign.deliverables && (
              <div className="flex items-start gap-1.5 text-xs text-foreground/90 pt-0.5">
                <Package className="h-3.5 w-3.5 text-[#FC801A] shrink-0 mt-0.5" />
                <p className="line-clamp-2 text-xs text-muted-foreground leading-snug">
                  {campaign.deliverables}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Clean Bottom Row: Status Toggle + View Deal button + Delete */}
        <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs gap-2">
          {/* Status Dropdown placed cleanly at bottom without "New Pitch" option */}
          <div className="relative">
            <select
              value={currentStatus === 'NEW_PITCH' ? '' : currentStatus}
              onChange={handleStatusChange}
              disabled={isPending}
              aria-label={`Update status for ${campaign.brand_name}`}
              className={`text-[11px] font-semibold pl-2.5 pr-6 py-1 rounded-full border appearance-none cursor-pointer focus:outline-none transition-colors ${badgeClass}`}
            >
              <option value="" disabled hidden>
                Set Status
              </option>

              {SELECTABLE_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-1.5 flex items-center">
              {isPending ? (
                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
              ) : (
                <ChevronDown className="h-3 w-3 opacity-60" />
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Deal Button */}
            <button
              type="button"
              onClick={() => setIsDetailsOpen(true)}
              className="text-xs font-bold text-white bg-[#FC801A] hover:bg-[#E66F0D] px-3 py-1 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              View Deal
            </button>

            {/* Delete button */}
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="text-muted-foreground hover:text-destructive p-1 rounded-lg transition-colors cursor-pointer"
              aria-label="Delete deal card"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      <CampaignDetailsModal
        campaign={campaign}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </>
  )
}
