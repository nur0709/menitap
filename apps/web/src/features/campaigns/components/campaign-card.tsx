'use client'

import { useState, useTransition } from 'react'
import { CreatorCampaign, CampaignStatus } from '../types'
import { updateCampaignStatus, deleteCampaign } from '../actions'
import { CampaignDetailsModal } from './campaign-details-modal'
import {
  extractEmailAddress,
  extractBrandDomain,
  extractFirstUrl,
  getGmailComposeUrl,
} from '../lib/action-helpers'
import {
  DollarSign,
  Package,
  Trash2,
  ChevronDown,
  Loader2,
  AlertCircle,
  Mail,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react'

interface CampaignCardProps {
  campaign: CreatorCampaign
}

const STATUS_CONFIG: Record<
  CampaignStatus,
  { label: string; badgeClass: string }
> = {
  NEW_PITCH: {
    label: 'New Pitch',
    badgeClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  },
  ACCEPTED: {
    label: 'Accepted',
    badgeClass: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
  },
  FILMING: {
    label: 'Filming',
    badgeClass: 'bg-[#FC801A]/10 text-[#FC801A] border-[#FC801A]/30',
  },
  DELIVERED: {
    label: 'Delivered',
    badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  PAID: {
    label: 'Paid ✓',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  DECLINED: {
    label: 'Declined',
    badgeClass: 'bg-muted text-muted-foreground border-border',
  },
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [currentStatus, setCurrentStatus] = useState<CampaignStatus>(campaign.status)
  const [copiedEmail, setCopiedEmail] = useState(false)

  // Action helpers
  const brandEmail = extractEmailAddress(campaign.source_sender)
  const brandDomain = extractBrandDomain(brandEmail, campaign.brand_name)
  const portalUrl = extractFirstUrl(campaign.raw_source_text)
  const brandWebsiteUrl = portalUrl || (brandDomain ? `https://${brandDomain}` : null)
  const gmailComposeUrl = brandEmail
    ? getGmailComposeUrl({
        toEmail: brandEmail,
        subject: campaign.source_subject || `${campaign.brand_name} Collaboration`,
      })
    : null

  const handleCopyBrandEmail = async () => {
    if (!brandEmail) return
    try {
      await navigator.clipboard.writeText(brandEmail)
      setCopiedEmail(true)
      setTimeout(() => setCopiedEmail(false), 2000)
    } catch {
      // Fallback
    }
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = e.target.value as CampaignStatus
    setCurrentStatus(nextStatus)
    startTransition(async () => {
      await updateCampaignStatus(campaign.id, nextStatus)
    })
  }

  const handleDelete = () => {
    if (confirm(`Delete ${campaign.brand_name} campaign?`)) {
      startTransition(async () => {
        await deleteCampaign(campaign.id)
      })
    }
  }

  // Calculate relative due date
  const getDeadlineBadge = () => {
    if (!campaign.deadline) return null
    const due = new Date(campaign.deadline)
    const now = new Date()
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
          <AlertCircle className="h-3 w-3" />
          Overdue
        </span>
      )
    }
    if (diffDays === 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#FC801A] bg-[#FC801A]/10 px-2 py-0.5 rounded-full border border-[#FC801A]/30">
          Due Today
        </span>
      )
    }
    if (diffDays <= 3) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
          Due in {diffDays}d
        </span>
      )
    }
    return (
      <span className="text-[10px] font-medium text-muted-foreground">
        Due {due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
      </span>
    )
  }

  const statusConfig = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.NEW_PITCH

  return (
    <>
      <div className="relative rounded-2xl bg-card border border-border p-4 sm:p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between group">
        <div>
          {/* Top Row: Brand Info + Status Selector */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 min-w-0">
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
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-foreground truncate">{campaign.brand_name}</h4>
                {campaign.product_name ? (
                  <p className="text-xs text-muted-foreground truncate">{campaign.product_name}</p>
                ) : (
                  <p className="text-[11px] text-muted-foreground/80 truncate">Campaign Collaboration</p>
                )}
              </div>
            </div>

            {/* Quick Status Dropdown */}
            <div className="relative shrink-0">
              <select
                value={currentStatus}
                onChange={handleStatusChange}
                disabled={isPending}
                aria-label={`Change status for ${campaign.brand_name}`}
                className={`text-[11px] font-semibold pl-2.5 pr-6 py-1 rounded-full border appearance-none cursor-pointer focus:outline-none transition-colors ${statusConfig.badgeClass}`}
              >
                <option value="NEW_PITCH">New Pitch</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="FILMING">Filming</option>
                <option value="DELIVERED">Delivered</option>
                <option value="PAID">Paid ✓</option>
                <option value="DECLINED">Declined</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-1.5 flex items-center">
                {isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-3 w-3 opacity-60" />
                )}
              </div>
            </div>
          </div>

          {/* Key Deliverables & Compensation */}
          <div className="space-y-2 my-3 pt-2 border-t border-border/60">
            {campaign.compensation && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {campaign.compensation}
                </span>
                {getDeadlineBadge()}
              </div>
            )}

            {campaign.deliverables && (
              <div className="flex items-start gap-1.5 text-xs text-foreground/90">
                <Package className="h-3.5 w-3.5 text-[#FC801A] shrink-0 mt-0.5" />
                <p className="line-clamp-2 text-xs text-muted-foreground leading-snug">
                  {campaign.deliverables}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actionable Toolbar */}
        <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs gap-1.5">
          <div className="flex items-center gap-1.5">
            {/* Reply in Gmail */}
            {gmailComposeUrl ? (
              <a
                href={gmailComposeUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={`Reply to ${brandEmail} in Gmail`}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#08739C]/10 text-[#08739C] dark:text-[#38BDF8] hover:bg-[#08739C]/20 font-medium text-[11px] transition-colors"
              >
                <Mail className="h-3 w-3" />
                <span>Reply</span>
              </a>
            ) : null}

            {/* Copy Brand Email */}
            {brandEmail ? (
              <button
                type="button"
                onClick={handleCopyBrandEmail}
                title={copiedEmail ? 'Copied brand email!' : `Copy ${brandEmail}`}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                aria-label="Copy brand email"
              >
                {copiedEmail ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            ) : null}

            {/* Visit Platform / Brand Website */}
            {brandWebsiteUrl ? (
              <a
                href={brandWebsiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={`Open ${brandDomain || campaign.brand_name} link`}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                aria-label="Open brand website or portal"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : null}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsDetailsOpen(true)}
              className="text-[11px] font-semibold text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-muted transition-colors cursor-pointer"
            >
              Brief
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="text-muted-foreground hover:text-destructive p-1 rounded-lg transition-colors cursor-pointer"
              aria-label="Delete campaign"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Details Modal with Quick Reply Drafts */}
      <CampaignDetailsModal
        campaign={campaign}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </>
  )
}
