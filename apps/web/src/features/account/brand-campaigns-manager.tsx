'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteBrandLink } from '@/features/links/actions'
import { Button } from '@/components/ui/button'
import { ExternalLink, Trash2, Building2, Package, Loader2 } from 'lucide-react'

export interface BrandCampaignItem {
  id: number
  brand_name: string
  application_url: string
  description?: string | null
  products_provided?: boolean | null
  click_count?: number | null
  categories?: { name: string } | null
}

export function BrandCampaignsManager({ campaigns }: { campaigns: BrandCampaignItem[] }) {
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = (id: number) => {
    setDeletingId(id)
    startTransition(async () => {
      await deleteBrandLink(id)
      router.refresh()
      setDeletingId(null)
    })
  }

  if (campaigns.length === 0) {
    return (
      <div className="w-full pt-4 border-t border-border mt-4 text-center">
        <div className="rounded-xl border border-dashed border-border p-5 text-center bg-muted/20">
          <Building2 className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
          <h4 className="text-xs font-semibold text-foreground">No Campaign Links Posted Yet</h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            You haven&apos;t posted any creator recruitment campaigns. Go to <strong>Campaign Links</strong> to recruit UGC creators.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full pt-4 border-t border-border mt-4 text-left">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          My Active Campaigns ({campaigns.length})
        </h4>
      </div>

      <div className="space-y-2">
        {campaigns.map((camp) => {
          const isDeleting = deletingId === camp.id

          return (
            <div
              key={camp.id}
              className="rounded-lg border border-border p-3 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground truncate">{camp.brand_name}</span>
                  {camp.products_provided && (
                    <span className="px-1.5 py-0.5 rounded bg-[#08739C]/10 text-[#08739C] dark:text-[#38BDF8] text-[10px] font-semibold border border-[#08739C]/20 flex items-center gap-1">
                      <Package className="h-2.5 w-2.5" />
                      Product Provided
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
                  {camp.categories?.name && (
                    <span>Category: {camp.categories.name}</span>
                  )}
                  <span>•</span>
                  <span>{camp.click_count || 0} applications</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={camp.application_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  title="Open application link"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isDeleting}
                  onClick={() => handleDelete(camp.id)}
                  className="h-7 px-2 text-destructive hover:bg-destructive/10 text-xs cursor-pointer"
                  title="Remove campaign"
                >
                  {isDeleting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
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
