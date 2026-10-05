'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CreatorUpgradeModal } from './creator-upgrade-modal'
import { Video, ArrowRight, Sparkles } from 'lucide-react'

export function UpgradeToCreatorButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div className="w-full pt-4 border-t border-border mt-4 text-center">
        <div className="bg-muted/40 rounded-xl p-4 border border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#FC801A] uppercase tracking-wide">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Ready to create content?</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Switch your Consumer account to a <strong>Creator</strong> account to receive products and post reviews.
            </p>
          </div>

          <Button
            onClick={() => setIsOpen(true)}
            size="sm"
            className="bg-[#FC801A] hover:bg-[#E66F0D] text-white border-0 font-medium shrink-0 shadow-xs cursor-pointer"
          >
            <Video className="h-3.5 w-3.5 mr-1.5" />
            Switch to Creator
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </div>

      <CreatorUpgradeModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}

