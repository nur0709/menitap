'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { adminDeleteBrandLink } from '@/features/links/actions'
import { Search, Trash2, ExternalLink, Package, Loader2, Sparkles } from 'lucide-react'

export interface ActiveCampaignItem {
  id: number
  brand_name: string
  application_url: string
  description: string | null
  products_provided: boolean
  click_count: number
  created_at: string
  categories?: { name: string } | null
  profiles?: { full_name: string | null } | null
}

export function AdminLiveCampaigns({ campaigns }: { campaigns: ActiveCampaignItem[] }) {
  const [search, setSearch] = useState('')
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const filteredCampaigns = campaigns.filter((camp) => {
    const q = search.toLowerCase()
    return (
      camp.brand_name.toLowerCase().includes(q) ||
      (camp.categories?.name || '').toLowerCase().includes(q) ||
      (camp.description || '').toLowerCase().includes(q)
    )
  })

  const handleDelete = (id: number, brandName: string) => {
    if (!confirm(`Are you sure you want to remove "${brandName}" from live collabs?`)) return
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
    <div className="w-full text-left space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#FC801A]" />
            Active Brand Collabs ({campaigns.length})
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Live campaigns currently visible on the /collabs board. Remove obsolete or broken links anytime.
          </p>
        </div>

        {campaigns.length > 0 && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search active collabs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs bg-card border-border"
            />
          </div>
        )}
      </div>

      {error && (
        <div className="p-2.5 rounded-lg text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
          {error}
        </div>
      )}

      {campaigns.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border border-dashed border-border bg-card/40">
          <p className="text-xs text-muted-foreground">
            No live campaigns active right now. Approved submissions will appear here.
          </p>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="p-6 text-center rounded-2xl border border-border bg-card/40">
          <p className="text-xs text-muted-foreground">
            No active collabs match &ldquo;{search}&rdquo;.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredCampaigns.map((camp) => {
            const isDeleting = processingId === camp.id && isPending
            const categoryName = camp.categories?.name || 'General'

            return (
              <div
                key={camp.id}
                className="p-3.5 rounded-xl border border-border bg-card hover:border-[#08739C]/40 transition-colors flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-foreground truncate">
                      {camp.brand_name}
                    </span>
                    <Badge variant="secondary" className="text-[10px] py-0 px-2">
                      {categoryName}
                    </Badge>
                    {camp.products_provided && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#08739C] dark:text-[#38BDF8]">
                        <Package className="h-3 w-3" />
                        Free Product
                      </span>
                    )}
                    <span className="text-[11px] text-muted-foreground">
                      • {camp.click_count || 0} applications
                    </span>
                  </div>

                  {camp.description && (
                    <p className="text-muted-foreground mt-1 text-[11px] line-clamp-1">
                      {camp.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={camp.application_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    title="View application link"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isDeleting}
                    onClick={() => handleDelete(camp.id, camp.brand_name)}
                    className="h-7 px-2 text-[11px] text-destructive hover:bg-destructive hover:text-white border-destructive/20 cursor-pointer"
                    title="Remove from platform"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="h-3 w-3 mr-1" />
                        Remove
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
