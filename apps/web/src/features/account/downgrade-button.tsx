'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { downgradeToConsumer } from './actions'
import { ShoppingBag, Loader2, AlertCircle } from 'lucide-react'

export function DowngradeToConsumerButton() {
  const [showConfirm, setShowConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleDowngrade = () => {
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
    <div className="w-full pt-4 border-t border-border mt-4 flex flex-col items-center justify-center">
      {error && (
        <div className="mb-3 p-2.5 rounded-lg text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20 w-full text-center">
          {error}
        </div>
      )}

      {!showConfirm ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowConfirm(true)}
          className="border-border text-foreground hover:bg-muted text-xs cursor-pointer"
        >
          <ShoppingBag className="h-3.5 w-3.5 mr-1.5 text-[#08739C]" />
          Switch to Consumer
        </Button>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <Button
            type="button"
            variant="default"
            size="sm"
            disabled={isPending}
            onClick={handleDowngrade}
            className="bg-[#08739C] hover:bg-[#02547A] text-white border-0 text-xs cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                Canceling...
              </>
            ) : (
              <>
                <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
                Confirm Cancellation
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={() => setShowConfirm(false)}
            className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  )
}
