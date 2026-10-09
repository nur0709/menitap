'use client'

import { useState, useRef } from 'react'
import { CreatorCampaign, CampaignStatus } from '../types'
import {
  extractEmailAddress,
  extractApplicationFormUrl,
  getGmailThreadUrl,
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
  Clock,
  Send,
} from 'lucide-react'

interface CampaignDetailsModalProps {
  campaign: CreatorCampaign
  currentStatus?: CampaignStatus
  currentDeadline?: string | null
  onDeadlineChange?: (newDeadline: string | null) => void
  userName?: string
  isOpen: boolean
  onClose: () => void
}

export function CampaignDetailsModal({
  campaign,
  currentDeadline,
  onDeadlineChange,
  userName,
  isOpen,
  onClose,
}: CampaignDetailsModalProps) {
  const [copiedReply, setCopiedReply] = useState(false)
  const [copiedForGmail, setCopiedForGmail] = useState(false)
  const [copiedForAccept, setCopiedForAccept] = useState(false)
  const activeDeadline = currentDeadline !== undefined ? currentDeadline : campaign.deadline
  const dateInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const brandEmail = extractEmailAddress(campaign.source_sender)
  const applicationUrl = extractApplicationFormUrl(campaign.raw_source_text)

  // Single clean, predefined Accept draft as requested by user
  const signoff = userName?.trim() ? `Best,\n${userName.trim()}` : 'Best,'
  const acceptDraftText = `Hi there,\n\nThank you for reaching out! I would love to collaborate with ${campaign.brand_name} on this campaign. The deliverables and compensation sound great.\n\n${signoff}`

  const emailUrl = getGmailThreadUrl({
    sourceMessageId: campaign.source_message_id,
    fromEmail: brandEmail,
    subject: campaign.source_subject,
    brandName: campaign.brand_name,
  })

  const gmailThreadUrl = emailUrl

  const gmailComposeUrl = brandEmail
    ? getGmailComposeUrl({
        toEmail: brandEmail,
        subject: campaign.source_subject || `${campaign.brand_name} Collaboration`,
        body: acceptDraftText,
      })
    : null

  const composeUrl =
    gmailComposeUrl ||
    (brandEmail
      ? `mailto:${brandEmail}?subject=${encodeURIComponent(campaign.source_subject ? `Re: ${campaign.source_subject}` : `${campaign.brand_name} Collaboration`)}&body=${encodeURIComponent(acceptDraftText)}`
      : emailUrl)

  const handleAcceptClick = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(acceptDraftText)
        .then(() => {
          setCopiedForAccept(true)
          setTimeout(() => setCopiedForAccept(false), 2500)
        })
        .catch(() => {})
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

  const handleOpenInGmail = () => {
    if (!gmailThreadUrl) return

    // 1. Copy draft to clipboard so user can simply paste into thread reply
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(acceptDraftText)
        .then(() => {
          setCopiedForGmail(true)
          setTimeout(() => setCopiedForGmail(false), 3000)
        })
        .catch(() => {
          // Fallback
        })
    }

    // 2. Open the main email thread directly in Gmail
    window.open(gmailThreadUrl, '_blank', 'noopener,noreferrer')
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
          ) : gmailThreadUrl ? (
            <button
              type="button"
              onClick={handleOpenInGmail}
              className="inline-flex items-center gap-1.5 bg-[#08739C] hover:bg-[#076184] text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>{copiedForGmail ? 'Opening in Gmail...' : 'Reply in Gmail ↗'}</span>
            </button>
          ) : null}
        </div>

        {/* Scrollable Content */}
        <div className="space-y-4 overflow-y-auto pr-1 text-xs text-foreground flex-1">
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
            <div
              onClick={() => {
                try {
                  dateInputRef.current?.showPicker()
                } catch {
                  dateInputRef.current?.focus()
                }
              }}
              className="p-3 rounded-xl bg-muted/30 hover:bg-muted/50 border border-border flex items-center justify-between gap-2.5 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Calendar className="h-4 w-4 text-[#FC801A] shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block truncate">
                    Due Date
                  </span>
                  <span className="text-[10px] text-muted-foreground/80 block leading-tight">
                    Set manually
                  </span>
                </div>
              </div>

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
                  e.stopPropagation()
                  try {
                    ;(e.target as HTMLInputElement).showPicker?.()
                  } catch {}
                }}
                title="Click to choose due date from calendar"
                aria-label="Choose due date from calendar"
                className="h-8 px-2.5 text-xs font-bold rounded-lg border border-[#FC801A]/30 bg-[#FC801A]/10 hover:bg-[#FC801A]/20 text-[#FC801A] cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-[#FC801A]/40 transition-colors shrink-0 accent-[#FC801A]"
              />
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

          {/* Raw Email Text & Open in Email Action */}
          {campaign.raw_source_text ? (
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                Original Email Content
              </span>
              <div className="p-3 rounded-xl bg-muted/50 border border-border max-h-44 overflow-y-auto text-[11px] text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed select-text">
                {campaign.raw_source_text}
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2 pt-0.5">
                <a
                  href={composeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleAcceptClick}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  {copiedForAccept ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-white" />
                      <span>Opening Compose (Draft Copied!)...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Accept with Ready to send draft</span>
                      <ExternalLink className="h-3 w-3 opacity-80" />
                    </>
                  )}
                </a>
                <a
                  href={emailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#08739C] hover:bg-[#076184] px-3.5 py-2 rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>Open in Email</span>
                  <ExternalLink className="h-3 w-3 opacity-80" />
                </a>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-end gap-2 pt-0.5">
              <a
                href={composeUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleAcceptClick}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                {copiedForAccept ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-white" />
                    <span>Opening Compose (Draft Copied!)...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Accept with Ready to send draft</span>
                    <ExternalLink className="h-3 w-3 opacity-80" />
                  </>
                )}
              </a>
              <a
                href={emailUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#08739C] hover:bg-[#076184] px-3.5 py-2 rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Open in Email</span>
                <ExternalLink className="h-3 w-3 opacity-80" />
              </a>
            </div>
          )}

          {/* Single Pre-written Accept Reply Draft (at bottom) */}
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
              <div className="flex flex-col gap-2 pt-1">
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCopyReply}
                    className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-xl border border-border bg-card cursor-pointer transition-colors"
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

                  {gmailThreadUrl && (
                    <button
                      type="button"
                      onClick={handleOpenInGmail}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#08739C] hover:bg-[#076184] px-3.5 py-1.5 rounded-xl transition-colors shadow-xs cursor-pointer"
                    >
                      {copiedForGmail ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-300" />
                          <span>Draft Copied & Opening Gmail...</span>
                        </>
                      ) : (
                        <>
                          <Mail className="h-3.5 w-3.5" />
                          <span>Open in Gmail to Reply ↗</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground px-0.5">
                  <span className="leading-tight">
                    💡 Opens the email thread in Gmail & copies draft to clipboard. Hit Reply & paste (⌘V)!
                  </span>
                  {gmailComposeUrl && (
                    <a
                      href={gmailComposeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-muted-foreground hover:text-foreground underline decoration-dotted shrink-0 ml-2"
                      title="Open standalone compose window instead"
                    >
                      Open blank compose
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
