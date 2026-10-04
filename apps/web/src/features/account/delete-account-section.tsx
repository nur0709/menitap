'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { deleteUserAccount } from './actions'
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react'

export function DeleteAccountSection() {
  const [showConfirm, setShowConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = () => {
    setError(null)
    startTransition(async () => {
      const res = await deleteUserAccount()
      if (res.error) {
        setError(res.error)
      } else {
        router.push('/')
        router.refresh()
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
          className="border-destructive/30 text-destructive hover:bg-destructive hover:text-white transition-colors text-xs cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
          Delete Account
        </Button>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={isPending}
            onClick={handleDelete}
            className="text-xs cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                Deleting Account...
              </>
            ) : (
              <>
                <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
                Yes, permanently delete my account
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
