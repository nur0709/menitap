'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { approveBrandLink, adminDeleteBrandLink } from '@/features/links/actions'
import { Check, Trash2, ExternalLink, Mail, Package, Loader2, Clock } from 'lucide-react'

export interface PendingCampaignItem {
  id: number
  brand_name: string
  contact_email: string | null
  application_url: string
  description: string | null
  compensation_details: string | null
  products_provided: boolean
  created_at: string
  categories?: { name: string } | null
}

export function AdminCampaignReview({ campaigns }: { campaigns: PendingCampaignItem[] }) {
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  if (campaigns.length === 0) {
    return null
  }

  const handleApprove = (id: number) => {
    setError(null)
    setProcessingId(id)
    startTransition(async () => {
      const res = await approveBrandLink(id)
      if (res.error) {
        setError(res.error)
      } else {
        router.refresh()
      }
      setProcessingId(null)
    })
  }

  const handleReject = (id: number) => {
    setError(null)
    setProcessingId(id)
    startTransition(async () => {
      const res = await adminDeleteBrandLink(id)
      if (res.error) {
        setError(res.error)
      } else {
        router.refresh()
      }
      setProcessingId(null)
    })
  }

  return (
    <div className="w-full pt-6 border-t border-border mt-6 text-left">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#FC801A]" />
          <h3 className="text-sm font-bold text-foreground">
            Pending Collab Submissions ({campaigns.length})
          </h3>
        </div>
        <Badge variant="outline" className="text-[10px] text-[#FC801A] border-[#FC801A]/30 bg-[#FC801A]/10">
          Admin Review
        </Badge>
      </div>

      {error && (
        <div className="mb-3 p-2.5 rounded-lg text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {campaigns.map((camp) => {
          const isCurrentPending = processingId === camp.id
          const categoryName = camp.categories?.name || 'General'

          return (
            <div
              key={camp.id}
              className="p-3.5 rounded-xl border border-border bg-card/60 hover:bg-card transition-colors flex flex-col gap-2.5 text-xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">{camp.brand_name}</span>
                    <Badge variant="secondary" className="text-[10px] py-0 px-2">
                      {categoryName}
                    </Badge>
                    {camp.products_provided && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#08739C] dark:text-[#38BDF8]">
                        <Package className="h-3 w-3" />
                        Free Product
                      </span>
                    )}
                  </div>

                  {camp.contact_email && (
                    <div className="flex items-center gap-1.5 text-muted-foreground mt-1">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span>{camp.contact_email}</span>
                    </div>
                  )}

                  {camp.compensation_details && (
                    <p className="text-muted-foreground mt-0.5 font-medium">
                      Perks: <span className="text-foreground">{camp.compensation_details}</span>
                    </p>
                  )}

                  {camp.description && (
                    <p className="text-muted-foreground mt-1 text-[11px] line-clamp-2">
                      {camp.description}
                    </p>
                  )}
                </div>

                <a
                  href={camp.application_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
                  title="Test Application Link"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>

              {/* Actions: Approve / Reject */}
              <div className="pt-2 border-t border-border/50 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isCurrentPending}
                  onClick={() => handleReject(camp.id)}
                  className="h-8 px-2.5 text-[11px] text-destructive hover:bg-destructive hover:text-white border-destructive/20 cursor-pointer"
                >
                  {isCurrentPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="h-3 w-3 mr-1" />
                      Reject
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  size="sm"
                  disabled={isCurrentPending}
                  onClick={() => handleApprove(camp.id)}
                  className="h-8 px-3 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-medium cursor-pointer shadow-xs"
                >
                  {isCurrentPending ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      Approve & Publish
                    </>
                  )}
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
