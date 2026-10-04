'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { upgradeToCreator, downgradeToConsumer } from './actions'
import { ShoppingBag, Sparkles, Loader2, AlertCircle } from 'lucide-react'

export function CreatorSubscriptionActions({ currentPlan }: { currentPlan: string }) {
  const [showConfirmCancel, setShowConfirmCancel] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const isBasic = currentPlan === 'BASIC' || currentPlan === 'CREATOR_TRIAL'
  const isStandard = currentPlan === 'STANDARD'

  const handlePlanChange = (targetPlan: 'BASIC' | 'STANDARD') => {
    setError(null)
    startTransition(async () => {
      const res = await upgradeToCreator(targetPlan)
      if (res.error) {
        setError(res.error)
      } else {
        window.location.reload()
      }
    })
  }

  const handleCancel = () => {
    setError(null)
    startTransition(async () => {
      const res = await downgradeToConsumer()
      if (res.error) {
        setError(res.error)
      } else {
        window.location.reload()
      }
    })
  }

  return (
    <div className="w-full pt-4 border-t border-border mt-4 flex flex-col items-center justify-center gap-3">
      {error && (
        <div className="mb-2 p-2.5 rounded-lg text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20 w-full text-center">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {/* If on $10 Basic, show button to upgrade to $15 Standard */}
        {isBasic && (
          <Button
            type="button"
            size="sm"
            disabled={isPending}
            onClick={() => handlePlanChange('STANDARD')}
            className="bg-[#FC801A] hover:bg-[#E66F0D] text-white border-0 text-xs shadow-xs cursor-pointer font-medium"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                Switching...
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Upgrade to $15 Standard Plan
              </>
            )}
          </Button>
        )}

        {/* If on $15 Standard, show button to switch to $10 Basic */}
        {isStandard && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => handlePlanChange('BASIC')}
            className="border-border text-foreground hover:bg-muted text-xs cursor-pointer font-medium"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                Switching...
              </>
            ) : (
              <>
                Switch to $10 Basic Plan
              </>
            )}
          </Button>
        )}

        {/* Cancel Creator subscription and switch to Explorer */}
        {!showConfirmCancel ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowConfirmCancel(true)}
            className="border-border text-foreground hover:bg-muted text-xs cursor-pointer"
          >
            <ShoppingBag className="h-3.5 w-3.5 mr-1.5 text-[#08739C]" />
            Cancel & Switch to Explorer
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="default"
              size="sm"
              disabled={isPending}
              onClick={handleCancel}
              className="bg-[#08739C] hover:bg-[#02547A] text-white border-0 text-xs cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Canceling...
                </>
              ) : (
                <>
                  <AlertCircle className="h-3.5 w-3.5 mr-1" />
                  Confirm Cancellation
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={() => setShowConfirmCancel(false)}
              className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
