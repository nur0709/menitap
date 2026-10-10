'use client'

import { useState } from 'react'
import { CreatorCampaign, CampaignStatus, nextStepLabel } from '../types'
import { CampaignDatePicker } from './campaign-date-picker'
import {
  extractEmailAddress,
  extractApplicationFormUrl,
  extractApplyLink,
  getGmailThreadUrl,
  getGmailComposeUrl,
} from '../lib/action-helpers'
import {
  X,
  FileText,
  Mail,
  DollarSign,
  Package,
  Check,
  ExternalLink,
  MessageSquare,
  Send,
} from 'lucide-react'

interface CampaignDetailsModalProps {
  campaign: CreatorCampaign
  currentStatus?: CampaignStatus
  currentDeadline?: string | null
  onDeadlineChange?: (newDeadline: string | null) => void
  onStatusChange?: (newStatus: CampaignStatus) => void
  userName?: string
  userEmail?: string
  isOpen: boolean
  onClose: () => void
}

export function CampaignDetailsModal({
  campaign,
  currentStatus,
  currentDeadline,
  onDeadlineChange,
  onStatusChange,
  userName,
  userEmail,
  isOpen,
  onClose,
}: CampaignDetailsModalProps) {
  const [copiedForAccept, setCopiedForAccept] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [showStatusPrompt, setShowStatusPrompt] = useState(false)
  const activeDeadline = currentDeadline !== undefined ? currentDeadline : campaign.deadline

  const brandEmail = extractEmailAddress(campaign.source_sender)
  const stepLabel = nextStepLabel(campaign.next_step)
  const applicationUrl =
    campaign.action_url ||
    extractApplyLink(campaign.raw_source_text) ||
    (campaign.next_step ? null : extractApplicationFormUrl(campaign.raw_source_text))
  const linkLabel = campaign.next_step === 'review_list'
    ? 'Open list'
    : campaign.next_step === 'fill_form' || !campaign.next_step
      ? 'Apply'
      : 'Open link'

  // Single clean, predefined Accept draft as requested by user
  const signoff = userName?.trim() ? `Best,\n${userName.trim()}` : 'Best,'
  const shortProduct = campaign.product_name
    ? campaign.product_name.split(' - ')[0].slice(0, 40).trim()
    : ''
  const collabTarget = shortProduct ? ` on the ${shortProduct} campaign` : ' on this campaign'
  const acceptDraftText = `Hi there,\n\nThank you for reaching out! I would love to collaborate with ${campaign.brand_name}${collabTarget}.\n\n${signoff}`
  const [customDraft, setCustomDraft] = useState(acceptDraftText)
  const [prevCampaignId, setPrevCampaignId] = useState(campaign.id)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)

  if (campaign.id !== prevCampaignId) {
    setPrevCampaignId(campaign.id)
    setCustomDraft(acceptDraftText)
    setHasInteracted(false)
    setShowStatusPrompt(false)
  }

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen)
    if (isOpen) {
      setHasInteracted(false)
      setShowStatusPrompt(false)
    }
  }

  if (!isOpen) return null

  const emailUrl = getGmailThreadUrl({
    sourceMessageId: campaign.source_message_id,
    fromEmail: brandEmail,
    subject: campaign.source_subject,
    brandName: campaign.brand_name,
    userEmail,
  })

  const gmailComposeUrl = brandEmail
    ? getGmailComposeUrl({
        toEmail: brandEmail,
        subject: campaign.source_subject || `${campaign.brand_name} Collaboration`,
        body: customDraft,
        userEmail,
      })
    : null

  const composeUrl =
    gmailComposeUrl ||
    (brandEmail
      ? `mailto:${brandEmail}?subject=${encodeURIComponent(campaign.source_subject ? `Re: ${campaign.source_subject}` : `${campaign.brand_name} Collaboration`)}&body=${encodeURIComponent(customDraft)}`
      : emailUrl)

  const handleAcceptClick = () => {
    setHasInteracted(true)
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(customDraft)
        .then(() => {
          setCopiedForAccept(true)
          setTimeout(() => setCopiedForAccept(false), 2500)
        })
        .catch(() => {})
    }
  }

  const handleRequestClose = () => {
    const effectiveStatus = currentStatus || campaign.status
    const isNewOrReviewed = effectiveStatus === 'NEW_PITCH' || effectiveStatus === 'REVIEWED'
    if (hasInteracted && isNewOrReviewed) {
      setShowStatusPrompt(true)
    } else {
      setHasInteracted(false)
      setShowStatusPrompt(false)
      onClose()
    }
  }

  const handleSelectStatus = (status: CampaignStatus) => {
    onStatusChange?.(status)
    setHasInteracted(false)
    setShowStatusPrompt(false)
    onClose()
  }

  const handleDismissStatusPrompt = () => {
    onStatusChange?.('REVIEWED')
    setHasInteracted(false)
    setShowStatusPrompt(false)
    onClose()
  }

  return (
    <div
      onClick={handleRequestClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl rounded-2xl bg-card border border-border p-5 sm:p-6 shadow-2xl text-left max-h-[92vh] flex flex-col"
      >
        {/* Close Button */}
        <button
          onClick={handleRequestClose}
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
                  <p className="text-xs text-muted-foreground font-medium truncate mt-0.5">
                    {campaign.product_name}
                  </p>
                )}
                {stepLabel ? (
                  <p className="text-[11px] font-semibold text-[#FC801A] mt-1">{stepLabel}</p>
                ) : null}
              </div>
          </div>

          {/* Prominent Apply Button (If application form URL exists) */}
          {applicationUrl && (
            <a
              href={applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setHasInteracted(true)}
              className="inline-flex items-center gap-1.5 bg-[#FC801A] hover:bg-[#E66F0D] text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-colors shrink-0"
            >
              <span>{linkLabel}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="space-y-4 overflow-y-auto pr-1 text-xs text-foreground flex-1">
          {/* Key Metrics: Compensation & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-start">
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

            {/* Due Date Card with inline custom calendar (no browser pop up) */}
            <CampaignDatePicker
              value={activeDeadline}
              onChange={(newDeadline) => onDeadlineChange?.(newDeadline)}
            />
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

          {/* Email Content */}
          <div className="space-y-1.5">
            <span className="text-[11px] uppercase font-bold text-muted-foreground flex items-center gap-1.5 tracking-wider">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              Email Content
            </span>
            <div className="p-3 rounded-xl bg-muted/50 border border-border max-h-44 overflow-y-auto text-[11px] text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed select-text">
              {campaign.raw_source_text || 'No raw email text available.'}
            </div>
          </div>

          {/* Reply (Editable Draft) */}
          <div className="space-y-2">
            <span className="text-[11px] uppercase font-bold text-muted-foreground flex items-center gap-1.5 tracking-wider">
              <MessageSquare className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              Reply
            </span>
            <textarea
              value={customDraft}
              onChange={(e) => setCustomDraft(e.target.value)}
              rows={4}
              className="w-full p-3 rounded-xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#08739C]/40 leading-relaxed font-sans shadow-xs resize-y"
              placeholder="Write your reply..."
            />

            {/* Action Buttons under Draft: Send and Open Email */}
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
                    <span>Opening Compose...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Send</span>
                    <ExternalLink className="h-3 w-3 opacity-80" />
                  </>
                )}
              </a>

              <a
                href={emailUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setHasInteracted(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#08739C] hover:bg-[#076184] px-3.5 py-2 rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Open Email</span>
                <ExternalLink className="h-3 w-3 opacity-80" />
              </a>
            </div>
          </div>
        </div>

        {/* Change Status Prompt Modal (when closing after interacting with Apply, Send, or Open Email) */}
        {showStatusPrompt && (
          <div
            onClick={handleDismissStatusPrompt}
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-background/60 backdrop-blur-xs animate-in fade-in duration-150"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm rounded-2xl bg-card border border-border p-5 shadow-2xl space-y-4 text-left"
            >
              <button
                type="button"
                onClick={handleDismissStatusPrompt}
                className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="pr-6">
                <h4 className="text-sm font-bold text-foreground">Change status?</h4>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleSelectStatus('APPLIED')}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 py-2.5 px-3 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Applied</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectStatus('DECLINED')}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-foreground bg-muted hover:bg-muted/80 border border-border py-2.5 px-3 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Declined</span>
                </button>
              </div>

              <div className="text-center pt-0.5">
                <button
                  type="button"
                  onClick={handleDismissStatusPrompt}
                  className="text-[11px] text-muted-foreground hover:text-foreground underline decoration-dotted transition-colors cursor-pointer"
                >
                  Keep as Reviewed
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
