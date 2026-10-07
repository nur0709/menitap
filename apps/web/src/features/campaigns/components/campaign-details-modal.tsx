'use client'

import { useState } from 'react'
import { CreatorCampaign } from '../types'
import { Button } from '@/components/ui/button'
import {
  extractEmailAddress,
  extractApplicationFormUrl,
  getGmailComposeUrl,
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
  isOpen: boolean
  onClose: () => void
}

export function CampaignDetailsModal({ campaign, isOpen, onClose }: CampaignDetailsModalProps) {
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [copiedReply, setCopiedReply] = useState(false)

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
  const renderHighlightedDeadline = () => {
    if (!campaign.deadline) return null
    const due = new Date(campaign.deadline)
    const now = new Date()
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
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
              <h3 className="text-base font-bold text-foreground truncate">{campaign.brand_name}</h3>
              {campaign.product_name && (
                <p className="text-xs text-muted-foreground font-medium truncate">{campaign.product_name}</p>
              )}
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
          <div className="grid grid-cols-2 gap-2.5">
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
            {campaign.deadline && (
              <div className="p-3 rounded-xl bg-muted/30 border border-border flex items-center gap-2.5">
                <Calendar className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8] shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                    Deadline
                  </span>
                  <div>{renderHighlightedDeadline()}</div>
                </div>
              </div>
            )}
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
        <div className="pt-3 border-t border-border mt-3 flex justify-end">
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
