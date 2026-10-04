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
    <div className="w-full pt-6 border-t border-border mt-6 text-left">
      <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 space-y-3">
        <div className="flex items-center gap-2 text-destructive font-semibold text-sm">
          <Trash2 className="h-4 w-4" />
          <span>Danger Zone: Delete Account</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Once you delete your account, your profile and saved data will be permanently removed. This action cannot be undone.
        </p>

        {error && (
          <div className="p-2.5 rounded-lg text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
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
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
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
    </div>
  )
}
