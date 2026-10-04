'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { upgradeToCreator } from './actions'
import { Video, ArrowRight, Loader2, Sparkles } from 'lucide-react'

export function UpgradeToCreatorButton() {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null)
  const router = useRouter()

  const handleUpgrade = () => {
    setMessage(null)
    startTransition(async () => {
      const result = await upgradeToCreator()
      if (result.error) {
        setMessage({ text: result.error, isError: true })
      } else if (result.success) {
        setMessage({ text: result.success, isError: false })
        router.refresh()
      }
    })
  }

  return (
    <div className="w-full pt-4 border-t border-border mt-4 text-center">
      {message && (
        <div
          className={`mb-3 p-2.5 rounded-lg text-xs font-medium ${
            message.isError
              ? 'bg-destructive/10 text-destructive border border-destructive/20'
              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
          }`}
        >
          {message.text}
        </div>
      )}

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
          onClick={handleUpgrade}
          disabled={isPending}
          size="sm"
          className="bg-[#FC801A] hover:bg-[#E66F0D] text-white border-0 font-medium shrink-0 shadow-xs cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              Switching...
            </>
          ) : (
            <>
              <Video className="h-3.5 w-3.5 mr-1.5" />
              Switch to Creator
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
