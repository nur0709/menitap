'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteBrandLink } from '@/features/links/actions'
import { Trash2, Loader2 } from 'lucide-react'

export function DeleteCollabButton({
  campaignId,
  brandName,
}: {
  campaignId: number
  brandName: string
}) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm(`Are you sure you want to remove "${brandName}"?`)) return

    startTransition(async () => {
      await deleteBrandLink(campaignId)
      router.refresh()
    })
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="p-1 rounded-md text-muted-foreground/70 hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
      title={`Delete ${brandName}`}
      aria-label={`Delete ${brandName}`}
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-destructive" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
    </button>
  )
}
