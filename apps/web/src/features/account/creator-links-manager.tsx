'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteAffiliateLink } from '@/features/links/actions'
import { Button } from '@/components/ui/button'
import { ExternalLink, Trash2, Tag, Loader2 } from 'lucide-react'

export interface AffiliateLinkItem {
  id: number
  title: string | null
  product_url: string
  promo_code: string | null
  click_count: number
  categories?: { name: string } | null
}

export function CreatorLinksManager({ links }: { links: AffiliateLinkItem[] }) {
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = (id: number) => {
    setDeletingId(id)
    startTransition(async () => {
      await deleteAffiliateLink(id)
      router.refresh()
      setDeletingId(null)
    })
  }

  if (links.length === 0) {
    return (
      <div className="w-full pt-4 border-t border-border mt-4 text-center">
        <div className="rounded-xl border border-dashed border-border p-5 text-center bg-muted/20">
          <Tag className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
          <h4 className="text-xs font-semibold text-foreground">No Affiliate Deals Shared Yet</h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            You haven&apos;t posted any affiliate deals. Head to <strong>Explore Deals</strong> to publish your first link.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full pt-4 border-t border-border mt-4 text-left">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          My Shared Affiliate Deals ({links.length})
        </h4>
      </div>

      <div className="space-y-2">
        {links.map((link) => (
          <div
            key={link.id}
            className="rounded-lg border border-border p-3 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
          >
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground truncate">{link.title}</span>
                {link.promo_code && (
                  <span className="px-1.5 py-0.5 rounded bg-[#FC801A]/10 text-[#FC801A] font-mono text-[10px] font-bold border border-[#FC801A]/20">
                    CODE: {link.promo_code}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
                {link.categories?.name && (
                  <span>Category: {link.categories.name}</span>
                )}
                <span>•</span>
                <span>{link.click_count || 0} clicks</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={link.product_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Open link"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={deletingId === link.id}
                onClick={() => handleDelete(link.id)}
                className="h-7 px-2 text-destructive hover:bg-destructive/10 text-xs cursor-pointer"
                title="Remove deal"
              >
                {deletingId === link.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
