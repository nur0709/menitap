'use client'

import React, { useState, useTransition } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AuthModal, type AccountType } from '@/features/auth/components/auth-modal'
import { upgradeToCreator, downgradeToConsumer } from '@/features/account/actions'
import { cn } from '@/lib/utils'
import { Check, Loader2, X, AlertTriangle } from 'lucide-react'

export type PlanId = 'FREE' | 'BASIC' | 'STANDARD'

interface PlanCtaButtonProps {
  targetPlan: PlanId
  userPlan: PlanId | null // null if signed out
  role: AccountType
  variant?: 'outline' | 'default'
  className?: string
  children: React.ReactNode
}

export function PlanCtaButton({
  targetPlan,
  userPlan,
  role,
  variant = 'default',
  className,
  children,
}: PlanCtaButtonProps) {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const isCurrentPlan = userPlan === targetPlan

  // If this is user's current plan
  if (isCurrentPlan) {
    return (
      <Button
        type="button"
        disabled
        className={cn(
          'w-full h-10 rounded-xl text-xs sm:text-sm font-semibold opacity-80 cursor-default border',
          targetPlan === 'STANDARD'
            ? 'bg-[#FC801A]/15 text-[#FC801A] border-[#FC801A]/30'
            : targetPlan === 'BASIC'
            ? 'bg-[#FC801A]/10 text-[#FC801A] border-[#FC801A]/25'
            : 'bg-muted text-muted-foreground border-border'
        )}
      >
        <Check className="h-4 w-4 mr-1.5 stroke-[2.5]" />
        Current Plan
      </Button>
    )
  }

  const handleClick = () => {
    // If not signed in: pop up sign up modal preset to role
    if (!userPlan) {
      setAuthModalOpen(true)
      return
    }

    // If signed in: open confirmation modal
    setError(null)
    setConfirmModalOpen(true)
  }

  const handleConfirmAction = () => {
    setError(null)
    startTransition(async () => {
      let result: { error?: string; success?: string }

      if (targetPlan === 'FREE') {
        result = await downgradeToConsumer()
      } else {
        result = await upgradeToCreator(targetPlan)
      }

      if (result.error) {
        setError(result.error)
      } else {
        setConfirmModalOpen(false)
        router.refresh()
      }
    })
  }

  // Determine dynamic modal copy
  const isDowngrade = targetPlan === 'FREE' || (userPlan === 'STANDARD' && targetPlan === 'BASIC')
  const planNames: Record<PlanId, string> = {
    FREE: 'Free',
    BASIC: 'Basic ($10/mo)',
    STANDARD: 'Standard ($15/mo)',
  }

  return (
    <>
      <Button
        type="button"
        variant={variant}
        onClick={handleClick}
        className={cn('w-full font-semibold cursor-pointer transition-all', className)}
      >
        {children}
      </Button>

      {/* Auth Modal for Signed-Out Visitors */}
      {authModalOpen && (
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialMode="signup"
          initialRole={role}
        />
      )}

      {/* Switch Plan Confirmation Modal for Logged-In Users */}
      {confirmModalOpen && mounted && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl text-left my-auto"
          >
            <button
              type="button"
              onClick={() => !isPending && setConfirmModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              {isDowngrade ? (
                <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              ) : (
                <div className="h-9 w-9 rounded-xl bg-[#FC801A]/10 text-[#FC801A] flex items-center justify-center">
                  <Check className="h-5 w-5" />
                </div>
              )}
              <h3 className="text-lg font-bold text-foreground">
                {isDowngrade ? 'Change Plan' : 'Confirm Plan Switch'}
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground mb-4">
              Switch your active membership to <strong>{planNames[targetPlan]}</strong>.
              {targetPlan === 'FREE' && ' Your Creator subscription will be canceled.'}
              {targetPlan === 'BASIC' && userPlan === 'STANDARD' && ' Your public portfolio will be disabled.'}
              {targetPlan === 'STANDARD' && ' You will gain access to public creator portfolio showcase.'}
            </p>

            {error && (
              <div className="mb-4 p-2.5 rounded-lg text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isPending}
                onClick={() => setConfirmModalOpen(false)}
                className="text-xs cursor-pointer text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isPending}
                onClick={handleConfirmAction}
                className={cn(
                  'font-medium text-xs shadow-xs cursor-pointer px-4',
                  targetPlan === 'STANDARD'
                    ? 'bg-[#FC801A] hover:bg-[#E66F0D] text-white border-0'
                    : isDowngrade
                    ? 'bg-foreground text-background hover:bg-foreground/90 border-0'
                    : 'bg-[#FC801A] hover:bg-[#E66F0D] text-white border-0'
                )}
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    Updating...
                  </>
                ) : (
                  <>Confirm Switch</>
                )}
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
