'use client'

import { useState, useRef } from 'react'
import { CreatorCampaign, CampaignStatus } from '../types'
import { Button } from '@/components/ui/button'
import {
  extractEmailAddress,
  extractApplicationFormUrl,
  getGmailComposeUrl,
  formatTimeAgo,
  formatExactDateTime,
} from '../lib/action-helpers'
import {
  X,
  FileText,
  Mail,
  Calendar,
  DollarSign,
  Package,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  Clock,
} from 'lucide-react'

interface CampaignDetailsModalProps {
  campaign: CreatorCampaign
  currentStatus?: CampaignStatus
  onStatusChange?: (newStatus: CampaignStatus) => void
  currentDeadline?: string | null
  onDeadlineChange?: (newDeadline: string | null) => void
  isOpen: boolean
  onClose: () => void
}

export function CampaignDetailsModal({
  campaign,
  currentStatus,
  onStatusChange,
  currentDeadline,
  onDeadlineChange,
  isOpen,
  onClose,
}: CampaignDetailsModalProps) {
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [copiedReply, setCopiedReply] = useState(false)

  const status = currentStatus || campaign.status
  const activeDeadline = currentDeadline !== undefined ? currentDeadline : campaign.deadline
  const dateInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const brandEmail = extractEmailAddress(campaign.source_sender)
  const applicationUrl = extractApplicationFormUrl(campaign.raw_source_text)

  // Single clean, predefined Accept draft as requested by user
  const acceptDraftText = `Hi there,\n\nThank you for reaching out! I would love to collaborate with ${campaign.brand_name} on this campaign. The deliverables and compensation sound great.\n\nPlease let me know if you need my shipping address or any further details to get started!\n\nBest,`

  const gmailDraftUrl = brandEmail
    ? getGmailComposeUrl({
        toEmail: brandEmail,
        subject: campaign.source_subject || `${campaign.brand_name} Collaboration`,
        body: acceptDraftText,
      })
    : null

  const handleCopyEmail = async () => {
    if (!brandEmail) return
    try {
      await navigator.clipboard.writeText(brandEmail)
      setCopiedEmail(true)
      setTimeout(() => setCopiedEmail(false), 2000)
    } catch {
      // Fallback
    }
  }

  const handleCopyReply = async () => {
    try {
      await navigator.clipboard.writeText(acceptDraftText)
      setCopiedReply(true)
      setTimeout(() => setCopiedReply(false), 2000)
    } catch {
      // Fallback
    }
  }

  // Highlighted Due Date helper
  const renderHighlightedDeadline = (dateStr: string) => {
    const due = new Date(dateStr)
    const now = new Date()
    const dueMidnight = new Date(due.getFullYear(), due.getMonth(), due.getDate())
    const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const diffDays = Math.round((dueMidnight.getTime() - nowMidnight.getTime()) / (1000 * 60 * 60 * 24))
    const formattedDate = due.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

    if (diffDays < 0) {
      return (
        <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
          <AlertCircle className="h-3.5 w-3.5" />
          Overdue ({formattedDate})
        </span>
      )
    }
    if (diffDays === 0) {
      return (
        <span className="text-xs font-bold text-[#FC801A] flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          Due Today!
        </span>
      )
    }
    if (diffDays <= 4) {
      return (
        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          Due {formattedDate} ({diffDays}d left)
        </span>
      )
    }
    return (
      <span className="text-xs font-semibold text-foreground">
        Due {formattedDate}
      </span>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl rounded-2xl bg-card border border-border p-5 sm:p-6 shadow-2xl text-left max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Brand Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border pb-4 mb-4 pr-8">
          <div className="flex items-center gap-3 min-w-0">
            {campaign.brand_logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={campaign.brand_logo_url}
                alt={campaign.brand_name}
                className="h-11 w-11 rounded-xl object-contain bg-background border border-border p-1 shrink-0"
              />
            ) : (
              <div className="h-11 w-11 rounded-xl bg-[#FC801A]/10 text-[#FC801A] font-bold flex items-center justify-center text-sm border border-[#FC801A]/20 shrink-0">
                {campaign.brand_name.slice(0, 2).toUpperCase()}
              </div>
            )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-foreground truncate">{campaign.brand_name}</h3>
                  {status === 'NEW_PITCH' ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shrink-0">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                      </span>
                      New
                    </span>
                  ) : status === 'REVIEWED' ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25 shrink-0">
                      Reviewed
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground border border-border shrink-0 capitalize">
                      {status.toLowerCase()}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                  {campaign.product_name && (
                    <p className="font-medium truncate">{campaign.product_name}</p>
                  )}
                  {campaign.product_name && campaign.created_at && <span>•</span>}
                  {campaign.created_at && (
                    <span
                      suppressHydrationWarning
                      title={formatExactDateTime(campaign.created_at)}
                      className="flex items-center gap-1 shrink-0 text-[11px] text-muted-foreground/80 whitespace-nowrap"
                    >
                      <Clock className="h-3 w-3 opacity-60" />
                      Received {formatTimeAgo(campaign.created_at)}
                    </span>
                  )}
                </div>
              </div>
          </div>

          {/* Prominent Apply Button (If application form URL exists) */}
          {applicationUrl ? (
            <a
              href={applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#FC801A] hover:bg-[#E66F0D] text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-colors shrink-0"
            >
              <span>Apply to Campaign</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : gmailDraftUrl ? (
            <a
              href={gmailDraftUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#08739C] hover:bg-[#076184] text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-colors shrink-0"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Apply via Email</span>
            </a>
          ) : null}
        </div>

        {/* Scrollable Content */}
        <div className="space-y-4 overflow-y-auto pr-1 text-xs text-foreground flex-1">
          {/* Brand Representative Email - clearly visible with 1-click copy */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-muted/40 border border-border">
            <div className="flex items-center gap-2.5 min-w-0">
              <Mail className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8] shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                  Brand Contact / Representative
                </span>
                <span className="font-mono text-xs text-foreground font-bold truncate block">
                  {brandEmail || campaign.source_sender || 'Representative Email'}
                </span>
              </div>
            </div>

            {brandEmail && (
              <button
                type="button"
                onClick={handleCopyEmail}
                className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors cursor-pointer self-start sm:self-auto shrink-0 shadow-xs"
              >
                {copiedEmail ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Copy Email</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Key Metrics: Compensation & Highlighted Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {campaign.compensation && (
              <div className="p-3 rounded-xl bg-muted/30 border border-border flex items-center gap-2.5">
                <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                    Compensation
                  </span>
                  <span className="font-bold text-foreground text-xs">{campaign.compensation}</span>
                </div>
              </div>
            )}

            {/* Due Date Card */}
            <div className="p-3 rounded-xl bg-muted/30 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <Calendar className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8] shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                    Due
                  </span>
                  <div className="truncate">
                    {activeDeadline ? (
                      renderHighlightedDeadline(activeDeadline)
                    ) : (
                      <span className="text-xs text-muted-foreground italic">No due date</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Native interactive date picker */}
              <div className="flex items-center shrink-0 self-start sm:self-auto">
                <input
                  ref={dateInputRef}
                  type="date"
                  value={activeDeadline ? activeDeadline.split('T')[0] : ''}
                  onChange={(e) => {
                    if (!e.target.value) {
                      onDeadlineChange?.(null)
                      return
                    }
                    const newIso = new Date(`${e.target.value}T23:59:59Z`).toISOString()
                    onDeadlineChange?.(newIso)
                  }}
                  onClick={(e) => {
                    try {
                      ;(e.target as HTMLInputElement).showPicker?.()
                    } catch {}
                  }}
                  title="Click to choose due date from calendar"
                  aria-label="Choose due date from calendar"
                  className="h-8 px-2.5 text-xs font-semibold rounded-lg border border-border bg-background hover:bg-muted text-foreground cursor-pointer shadow-xs focus:outline-none focus:ring-1 focus:ring-foreground/20"
                />
              </div>
            </div>
          </div>

          {/* Deliverables */}
          {campaign.deliverables && (
            <div className="p-3 rounded-xl bg-muted/30 border border-border space-y-1">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-[#FC801A]" />
                Deliverables
              </span>
              <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                {campaign.deliverables}
              </p>
            </div>
          )}

          {/* Single Pre-written Accept Reply Draft */}
          {brandEmail && (
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-[#08739C] dark:text-[#38BDF8]" />
                  Accept Collaboration (Ready-to-Send Reply)
                </span>
                <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  Pre-filled Draft
                </span>
              </div>

              {/* Draft Preview Box */}
              <div className="p-3 rounded-lg bg-background border border-border text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap font-sans">
                {acceptDraftText}
              </div>

              {/* Action Buttons for Draft */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyReply}
                  className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-xl border border-border bg-card cursor-pointer"
                >
                  {copiedReply ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Copied Draft</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Draft</span>
                    </>
                  )}
                </button>

                {gmailDraftUrl && (
                  <a
                    href={gmailDraftUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#08739C] hover:bg-[#076184] px-3.5 py-1.5 rounded-xl transition-colors shadow-xs"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>Open in Gmail to Reply ↗</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Raw Email Text */}
          {campaign.raw_source_text && (
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                Original Email Content
              </span>
              <div className="p-3 rounded-xl bg-muted/50 border border-border max-h-44 overflow-y-auto text-[11px] text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed select-text">
                {campaign.raw_source_text}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-border mt-3 flex items-center justify-between gap-3">
          {onStatusChange ? (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-muted-foreground">Status:</span>
              <select
                value={status}
                onChange={(e) => onStatusChange(e.target.value as CampaignStatus)}
                className="text-xs font-semibold px-2.5 py-1 rounded-xl border border-border bg-background text-foreground cursor-pointer focus:outline-none"
              >
                {status === 'NEW_PITCH' && <option value="NEW_PITCH">New</option>}
                {status === 'REVIEWED' && <option value="REVIEWED">Reviewed</option>}
                <option value="APPLIED">Applied</option>
                <option value="WAITING_PRODUCT">Waiting on Product</option>
                <option value="SUBMITTED">Draft Submitted</option>
                <option value="PAYMENT_PENDING">Payment Pending</option>
                <option value="PAID">Paid ✓</option>
                <option value="DECLINED">Declined</option>
              </select>
            </div>
          ) : (
            <div />
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs h-8 rounded-xl cursor-pointer"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
