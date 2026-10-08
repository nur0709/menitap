'use client'

import { useState, useTransition } from 'react'
import { CreatorCampaign, CampaignStatus } from '../types'
import { updateCampaignStatus, toggleCampaignLiked } from '../actions'
import { formatTimeAgo, formatExactDateTime } from '../lib/action-helpers'
import { CampaignDetailsModal } from './campaign-details-modal'
import {
  DollarSign,
  Calendar,
  Package,
  ChevronDown,
  Loader2,
  AlertCircle,
  Clock,
  Heart,
  Check,
} from 'lucide-react'

interface CampaignCardProps {
  campaign: CreatorCampaign
  isSelectionMode?: boolean
  isSelected?: boolean
  onToggleSelect?: () => void
}

// Actionable creator stages in dropdown — New & Reviewed are view states, not manual choices
const SELECTABLE_STATUSES: { value: CampaignStatus; label: string }[] = [
  { value: 'APPLIED', label: 'Applied' },
  { value: 'WAITING_PRODUCT', label: 'Waiting on Product' },
  { value: 'SUBMITTED', label: 'Draft Submitted' },
  { value: 'PAYMENT_PENDING', label: 'Payment Pending' },
  { value: 'PAID', label: 'Paid ✓' },
  { value: 'DECLINED', label: 'Declined' },
]

const STATUS_CONFIG: Record<CampaignStatus, { label: string; className: string }> = {
  NEW_PITCH: {
    label: 'New',
    className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
  },
  REVIEWED: {
    label: 'Reviewed',
    className: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/25',
  },
  APPLIED: {
    label: 'Applied',
    className: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25',
  },
  WAITING_PRODUCT: {
    label: 'Waiting on Product',
    className: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
  },
  SUBMITTED: {
    label: 'Draft Submitted',
    className: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25',
  },
  PAYMENT_PENDING: {
    label: 'Payment Pending',
    className: 'bg-[#FC801A]/10 text-[#FC801A] border-[#FC801A]/30',
  },
  PAID: {
    label: 'Paid ✓',
    className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
  },
  DECLINED: {
    label: 'Declined',
    className: 'bg-muted text-muted-foreground border-border',
  },
  ACCEPTED: {
    label: 'Applied',
    className: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25',
  },
  FILMING: {
    label: 'Draft Submitted',
    className: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25',
  },
  DELIVERED: {
    label: 'Payment Pending',
    className: 'bg-[#FC801A]/10 text-[#FC801A] border-[#FC801A]/30',
  },
}

export function CampaignCard({
  campaign,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelect,
}: CampaignCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [currentStatus, setCurrentStatus] = useState<CampaignStatus>(campaign.status)
  const [isLiked, setIsLiked] = useState<boolean>(Boolean(campaign.is_liked))

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = e.target.value as CampaignStatus
    setCurrentStatus(nextStatus)
    startTransition(async () => {
      await updateCampaignStatus(campaign.id, nextStatus)
    })
  }

  const handleOpenReview = () => {
    setIsDetailsOpen(true)
    if (currentStatus === 'NEW_PITCH') {
      setCurrentStatus('REVIEWED')
      startTransition(async () => {
        await updateCampaignStatus(campaign.id, 'REVIEWED')
      })
    }
  }

  const handleToggleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    const nextLiked = !isLiked
    setIsLiked(nextLiked)
    startTransition(async () => {
      await toggleCampaignLiked(campaign.id, nextLiked)
    })
  }

  const handleCardClick = () => {
    if (isSelectionMode) {
      onToggleSelect?.()
      return
    }
    handleOpenReview()
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
  const statusInfo = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.DECLINED

  // Card border and background states
  let cardBorderClass = 'border-border hover:border-foreground/25'
  if (isSelectionMode && isSelected) {
    cardBorderClass = 'border-[#FC801A] ring-2 ring-[#FC801A]/20 bg-[#FC801A]/[0.03]'
  } else if (isSelectionMode) {
    cardBorderClass = 'border-border hover:border-[#FC801A]/60'
  } else if (isNew) {
    cardBorderClass = 'border-emerald-500/30 border-l-[3.5px] border-l-emerald-500 dark:border-l-emerald-400 hover:border-foreground/25'
  }

  return (
    <>
      <div
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleCardClick()
        }}
        className={`relative rounded-2xl bg-card border p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20 select-none ${cardBorderClass}`}
      >
        <div>
          {/* Top: Selection checkbox / Logo / Brand header + Heart like button */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              {/* Checkbox only in Selection Mode */}
              {isSelectionMode && (
                <div
                  className={`h-5 w-5 mt-2.5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                    isSelected
                      ? 'bg-[#FC801A] border-[#FC801A] text-white shadow-xs'
                      : 'border-border bg-background hover:border-foreground/40'
                  }`}
                >
                  {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                </div>
              )}

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

            {/* Top Right: Heart Favorite Toggle */}
            <button
              type="button"
              onClick={handleToggleLike}
              disabled={isPending}
              title={isLiked ? 'Remove from favorites' : 'Save to favorites'}
              aria-label={isLiked ? 'Remove from favorites' : 'Save to favorites'}
              className={`p-1.5 rounded-full transition-all cursor-pointer shrink-0 ${
                isLiked
                  ? 'text-rose-500 hover:text-rose-600 bg-rose-500/10'
                  : 'text-muted-foreground/50 hover:text-rose-500 hover:bg-muted'
              }`}
            >
              <Heart
                className={`h-4 w-4 transition-transform active:scale-125 ${
                  isLiked ? 'fill-rose-500' : ''
                }`}
              />
            </button>
          </div>

          {/* Key Metrics: Compensation & Highlighted Due Date */}
          <div className="space-y-2.5 my-3 pt-2.5 border-t border-border/60">
            <div className="flex wrap items-center gap-2 text-xs">
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

        {/* Clean Bottom Row: Status Pill Dropdown (Actionable stages only) + Received Date */}
        <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs gap-2">
          {/* Status Dropdown */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <select
              value={['NEW_PITCH', 'REVIEWED'].includes(currentStatus) ? '' : currentStatus}
              onChange={handleStatusChange}
              disabled={isPending || isSelectionMode}
              aria-label={`Update status for ${campaign.brand_name}`}
              className={`text-[11px] font-semibold pl-2.5 pr-6 py-1 rounded-full border appearance-none cursor-pointer focus:outline-none transition-colors ${statusInfo.className}`}
            >
              {currentStatus === 'NEW_PITCH' && (
                <option value="" disabled hidden>
                  New
                </option>
              )}
              {currentStatus === 'REVIEWED' && (
                <option value="" disabled hidden>
                  Reviewed
                </option>
              )}
              {!['NEW_PITCH', 'REVIEWED'].includes(currentStatus) && (
                <option value="" disabled hidden>
                  Change Status
                </option>
              )}

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

          {/* Received Time */}
          {campaign.created_at && (
            <span
              suppressHydrationWarning
              title={formatExactDateTime(campaign.created_at)}
              className="text-[11px] font-medium text-muted-foreground/80 flex items-center gap-1 whitespace-nowrap"
            >
              <Clock className="h-3 w-3 opacity-60" />
              {formatTimeAgo(campaign.created_at)}
            </span>
          )}
        </div>
      </div>

      {/* Details Modal */}
      <CampaignDetailsModal
        campaign={campaign}
        currentStatus={currentStatus}
        onStatusChange={(newStatus) => {
          setCurrentStatus(newStatus)
          startTransition(async () => {
            await updateCampaignStatus(campaign.id, newStatus)
          })
        }}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </>
  )
}
