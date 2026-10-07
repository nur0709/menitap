'use client'

import { useState } from 'react'
import { CreatorCampaign } from '../types'
import { Button } from '@/components/ui/button'
import {
  extractEmailAddress,
  extractBrandDomain,
  extractFirstUrl,
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
} from 'lucide-react'

interface CampaignDetailsModalProps {
  campaign: CreatorCampaign
  isOpen: boolean
  onClose: () => void
}

export function CampaignDetailsModal({ campaign, isOpen, onClose }: CampaignDetailsModalProps) {
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [copiedReply, setCopiedReply] = useState(false)
  const [replyTemplate, setReplyTemplate] = useState<'ACCEPT' | 'COUNTER' | 'QUESTIONS'>('ACCEPT')

  if (!isOpen) return null

  const brandEmail = extractEmailAddress(campaign.source_sender)
  const brandDomain = extractBrandDomain(brandEmail, campaign.brand_name)
  const portalUrl = extractFirstUrl(campaign.raw_source_text)
  const brandWebsiteUrl = portalUrl || (brandDomain ? `https://${brandDomain}` : null)

  // Smart Pre-written replies
  const getDraftText = () => {
    switch (replyTemplate) {
      case 'ACCEPT':
        return `Hi there,\n\nThank you for reaching out! I would love to partner with ${campaign.brand_name} on this campaign. The deliverables and compensation sound great.\n\nPlease let me know if you need my shipping address to send out the product!\n\nBest,`
      case 'COUNTER':
        return `Hi there,\n\nThank you for thinking of me! I'm a big fan of ${campaign.brand_name} and would love to collaborate. Given the deliverables and ad usage rights, my standard rate for this project would be [Enter Rate]. Let me know if that works within your campaign budget!\n\nBest,`
      case 'QUESTIONS':
        return `Hi there,\n\nThanks for reaching out! Could you please share the full creative brief, key talking points, and due date so I can review?\n\nBest,`
    }
  }

  const draftText = getDraftText()
  const gmailDraftUrl = brandEmail
    ? getGmailComposeUrl({
        toEmail: brandEmail,
        subject: campaign.source_subject || `${campaign.brand_name} Collaboration`,
        body: draftText,
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
      await navigator.clipboard.writeText(draftText)
      setCopiedReply(true)
      setTimeout(() => setCopiedReply(false), 2000)
    } catch {
      // Fallback
    }
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
                <p className="text-xs text-muted-foreground truncate">{campaign.product_name}</p>
              )}
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {brandEmail && (
              <button
                type="button"
                onClick={handleCopyEmail}
                title={`Copy ${brandEmail}`}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl border border-border bg-muted/50 hover:bg-muted text-foreground transition-colors cursor-pointer"
              >
                {copiedEmail ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Copy Email</span>
                  </>
                )}
              </button>
            )}

            {brandWebsiteUrl && (
              <a
                href={brandWebsiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Visit brand website or portal"
                className="p-1.5 rounded-xl border border-border bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="space-y-4 overflow-y-auto pr-1 text-xs text-foreground flex-1">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-2.5">
            {campaign.compensation && (
              <div className="p-3 rounded-xl bg-muted/40 border border-border flex items-center gap-2.5">
                <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                    Compensation
                  </span>
                  <span className="font-semibold text-foreground text-xs">{campaign.compensation}</span>
                </div>
              </div>
            )}
            {campaign.deadline && (
              <div className="p-3 rounded-xl bg-muted/40 border border-border flex items-center gap-2.5">
                <Calendar className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8] shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                    Due Date
                  </span>
                  <span className="font-semibold text-foreground text-xs">
                    {new Date(campaign.deadline).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
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

          {/* 1-Click Quick Reply Draft */}
          {brandEmail && (
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-[#08739C] dark:text-[#38BDF8]" />
                  Quick Reply to {campaign.brand_name}
                </span>

                {/* Template Switcher */}
                <div className="flex items-center gap-1 bg-background p-0.5 rounded-lg border border-border text-[10px]">
                  <button
                    onClick={() => setReplyTemplate('ACCEPT')}
                    className={`px-2 py-0.5 rounded font-medium cursor-pointer transition-colors ${
                      replyTemplate === 'ACCEPT' ? 'bg-[#FC801A] text-white font-bold' : 'text-muted-foreground'
                    }`}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => setReplyTemplate('COUNTER')}
                    className={`px-2 py-0.5 rounded font-medium cursor-pointer transition-colors ${
                      replyTemplate === 'COUNTER' ? 'bg-[#FC801A] text-white font-bold' : 'text-muted-foreground'
                    }`}
                  >
                    Counter
                  </button>
                  <button
                    onClick={() => setReplyTemplate('QUESTIONS')}
                    className={`px-2 py-0.5 rounded font-medium cursor-pointer transition-colors ${
                      replyTemplate === 'QUESTIONS' ? 'bg-[#FC801A] text-white font-bold' : 'text-muted-foreground'
                    }`}
                  >
                    Ask Brief
                  </button>
                </div>
              </div>

              {/* Draft Preview Box */}
              <div className="p-2.5 rounded-lg bg-background border border-border text-[11px] text-muted-foreground leading-relaxed whitespace-pre-wrap font-sans">
                {draftText}
              </div>

              {/* Action Buttons for Draft */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyReply}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-lg border border-border bg-card cursor-pointer"
                >
                  {copiedReply ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-600" />
                      <span>Copied Draft</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy Draft</span>
                    </>
                  )}
                </button>

                {gmailDraftUrl && (
                  <a
                    href={gmailDraftUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-white bg-[#08739C] hover:bg-[#076184] px-3 py-1 rounded-lg transition-colors shadow-xs"
                  >
                    <Mail className="h-3 w-3" />
                    <span>Open in Gmail Draft ↗</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Raw Email / Brief Text */}
          {campaign.raw_source_text && (
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                Original Email / Brief
              </span>
              <div className="p-3 rounded-xl bg-muted/50 border border-border max-h-40 overflow-y-auto text-[11px] text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed select-text">
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
