'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { trackCollabInCrm } from '../actions'
import { Plus, Check, Loader2 } from 'lucide-react'

interface TrackCollabButtonProps {
  collabId: number
}

export function TrackCollabButton({ collabId }: TrackCollabButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isTracked, setIsTracked] = useState(false)

  const handleTrack = () => {
    if (isTracked || isPending) return

    startTransition(async () => {
      const res = await trackCollabInCrm(collabId)
      if (res.error) {
        if (res.error.includes('sign in')) {
          router.push('/sign-in')
        } else {
          alert(res.error)
        }
      } else {
        setIsTracked(true)
      }
    })
  }

  if (isTracked) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
        <Check className="h-3 w-3" />
        <span>Tracked</span>
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={handleTrack}
      disabled={isPending}
      className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
      title="Track this brand collab on your CRM Kanban board"
    >
      {isPending ? (
        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
      ) : (
        <Plus className="h-3 w-3" />
      )}
      <span>{isPending ? 'Tracking...' : 'Track Deal'}</span>
    </button>
  )
}
