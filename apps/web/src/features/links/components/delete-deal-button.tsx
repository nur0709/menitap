'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteAffiliateLink } from '@/features/links/actions'
import { Trash2, Loader2 } from 'lucide-react'

export function DeleteDealButton({
  dealId,
  dealTitle,
}: {
  dealId: number
  dealTitle?: string | null
}) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const name = dealTitle || 'this deal'
    if (!confirm(`Are you sure you want to remove "${name}"?`)) return

    startTransition(async () => {
      await deleteAffiliateLink(dealId)
      router.refresh()
    })
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="p-1 rounded-md text-muted-foreground/70 hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
      title={`Delete ${dealTitle || 'deal'}`}
      aria-label={`Delete ${dealTitle || 'deal'}`}
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-destructive" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
    </button>
  )
}
