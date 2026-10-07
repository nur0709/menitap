'use client'

import { CreatorCampaign } from '../types'
import { Button } from '@/components/ui/button'
import { X, FileText, Mail, Calendar, DollarSign, Package } from 'lucide-react'

interface CampaignDetailsModalProps {
  campaign: CreatorCampaign
  isOpen: boolean
  onClose: () => void
}

export function CampaignDetailsModal({ campaign, isOpen, onClose }: CampaignDetailsModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-card border border-border p-6 shadow-2xl text-left max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border pb-4 mb-4">
          {campaign.brand_logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={campaign.brand_logo_url}
              alt={campaign.brand_name}
              className="h-11 w-11 rounded-xl object-contain bg-background border border-border p-1"
            />
          ) : (
            <div className="h-11 w-11 rounded-xl bg-[#FC801A]/10 text-[#FC801A] font-bold flex items-center justify-center text-sm border border-[#FC801A]/20">
              {campaign.brand_name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-foreground truncate">{campaign.brand_name}</h3>
            {campaign.product_name && (
              <p className="text-xs text-muted-foreground truncate">{campaign.product_name}</p>
            )}
          </div>
        </div>

        {/* Scrollable details */}
        <div className="space-y-4 overflow-y-auto pr-1 text-xs text-foreground flex-1">
          {/* Quick Stats Grid */}
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

          {/* Source Details */}
          {(campaign.source_sender || campaign.source_subject) && (
            <div className="p-3 rounded-xl bg-muted/30 border border-border space-y-1">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-[#08739C]" />
                Inbound Source
              </span>
              {campaign.source_subject && (
                <p className="text-xs font-medium text-foreground">
                  Subject: {campaign.source_subject}
                </p>
              )}
              {campaign.source_sender && (
                <p className="text-[11px] text-muted-foreground">From: {campaign.source_sender}</p>
              )}
            </div>
          )}

          {/* Raw Email / Brief Text */}
          {campaign.raw_source_text && (
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                Original Email / Brief Text
              </span>
              <div className="p-3 rounded-xl bg-muted/50 border border-border max-h-48 overflow-y-auto text-[11px] text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed select-text">
                {campaign.raw_source_text}
              </div>
            </div>
          )}

          {/* Notes */}
          {campaign.notes && (
            <div className="p-3 rounded-xl bg-muted/30 border border-border space-y-1">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                Personal Notes
              </span>
              <p className="text-xs text-foreground whitespace-pre-wrap">{campaign.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-border mt-4 flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs h-8 cursor-pointer"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
