'use client'

import React, { useState, useTransition } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { upgradeToCreator, type UpgradePlan } from '@/features/account/actions'
import { Video, Loader2, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CreatorUpgradeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreatorUpgradeModal({ isOpen, onClose }: CreatorUpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<UpgradePlan>('BASIC')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  if (!isOpen || !mounted) return null

  const handleConfirmUpgrade = () => {
    setError(null)
    startTransition(async () => {
      const result = await upgradeToCreator(selectedPlan)
      if (result.error) {
        setError(result.error)
      } else {
        onClose()
        router.refresh()
      }
    })
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="creator-upgrade-title"
      className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-2xl bg-card border border-border p-6 shadow-2xl transition-all my-auto"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => !isPending && onClose()}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="h-10 w-10 rounded-xl bg-[#FC801A]/10 text-[#FC801A] flex items-center justify-center mx-auto mb-3">
            <Video className="h-5 w-5" />
          </div>
          <h3 id="creator-upgrade-title" className="text-xl font-bold text-foreground">Choose Creator Plan</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Select your Creator subscription tier to start reviewing products.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
            {error}
          </div>
        )}

        {/* Plan Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {/* Option 1: Basic $10/mo */}
          <button
            type="button"
            onClick={() => setSelectedPlan('BASIC')}
            className={cn(
              'p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer relative',
              selectedPlan === 'BASIC'
                ? 'border-[#08739C] bg-[#08739C]/5 ring-2 ring-[#08739C]'
                : 'border-border bg-card hover:bg-muted/40'
            )}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-foreground">Creator Basic</span>
                {selectedPlan === 'BASIC' && (
                  <div className="h-4 w-4 rounded-full bg-[#08739C] text-white flex items-center justify-center">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </div>
                )}
              </div>
              <div className="text-2xl font-black text-foreground">
                $10<span className="text-xs font-normal text-muted-foreground">/mo</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1 mb-3">
                For active UGC creators starting out
              </p>
              <ul className="text-[11px] space-y-1.5 text-muted-foreground">
                <li className="flex items-center gap-1.5">
                  <Check className="h-3 w-3 text-[#08739C] shrink-0" />
                  <span>Direct brand collab links</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3 w-3 text-[#08739C] shrink-0" />
                  <span>Receive free products to keep</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3 w-3 text-[#08739C] shrink-0" />
                  <span>Share affiliate deals</span>
                </li>
              </ul>
            </div>
          </button>

          {/* Option 2: Standard $15/mo */}
          <button
            type="button"
            onClick={() => setSelectedPlan('STANDARD')}
            className={cn(
              'p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer relative',
              selectedPlan === 'STANDARD'
                ? 'border-[#FC801A] bg-[#FC801A]/5 ring-2 ring-[#FC801A]'
                : 'border-border bg-card hover:bg-muted/40'
            )}
          >
            <div className="absolute -top-2.5 right-3">
              <Badge className="bg-[#FC801A] text-white text-[9px] px-2 py-0 border-0 font-bold shadow-xs">
                Popular
              </Badge>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-foreground">Creator Standard</span>
                {selectedPlan === 'STANDARD' && (
                  <div className="h-4 w-4 rounded-full bg-[#FC801A] text-white flex items-center justify-center">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </div>
                )}
              </div>
              <div className="text-2xl font-black text-foreground">
                $15<span className="text-xs font-normal text-muted-foreground">/mo</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1 mb-3">
                Get discovered & hired by brands
              </p>
              <ul className="text-[11px] space-y-1.5 text-muted-foreground">
                <li className="flex items-center gap-1.5 font-medium text-foreground">
                  <Check className="h-3 w-3 text-[#FC801A] shrink-0" />
                  <span>Everything in Basic</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3 w-3 text-[#FC801A] shrink-0" />
                  <span>Public creator portfolio</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3 w-3 text-[#FC801A] shrink-0" />
                  <span>Featured to brand managers</span>
                </li>
              </ul>
            </div>
          </button>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={onClose}
            className="text-xs cursor-pointer text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isPending}
            onClick={handleConfirmUpgrade}
            className={cn(
              'text-white border-0 font-medium text-xs shadow-xs cursor-pointer px-4',
              selectedPlan === 'STANDARD'
                ? 'bg-[#FC801A] hover:bg-[#E66F0D]'
                : 'bg-[#08739C] hover:bg-[#02547A]'
            )}
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                Activating...
              </>
            ) : (
              <>
                Confirm & Switch ({selectedPlan === 'STANDARD' ? '$15/mo' : '$10/mo'})
              </>
            )}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}
