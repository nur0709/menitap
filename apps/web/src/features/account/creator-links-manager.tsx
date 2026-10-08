'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteAffiliateLink } from '@/features/links/actions'
import { AddDealModal, Category } from '@/features/links/components/add-deal-modal'
import { ExternalLink, Trash2, Tag, Loader2, Copy, Check } from 'lucide-react'

export interface AffiliateLinkItem {
  id: number
  title: string | null
  product_url: string
  promo_code: string | null
  click_count: number
  categories?: { name: string } | null
}

export function CreatorLinksManager({
  links,
  categories = [],
}: {
  links: AffiliateLinkItem[]
  categories?: Category[]
}) {
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const router = useRouter()

  const handleCopy = (text: string, key: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 2000)
    }
  }

  const handleDelete = (id: number) => {
    if (confirm('Delete this affiliate link?')) {
      setDeletingId(id)
      startTransition(async () => {
        await deleteAffiliateLink(id)
        router.refresh()
        setDeletingId(null)
      })
    }
  }

  return (
    <div className="space-y-4 text-left">
      {/* Clean Header Toolbar */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-foreground">Affiliate Links & Codes</h3>
          <span className="text-[11px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {links.length}
          </span>
        </div>

        {categories.length > 0 && (
          <AddDealModal categories={categories} buttonLabel="Add My Affiliate" />
        )}
      </div>

      {links.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 sm:p-12 text-center bg-card/40">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground mb-2.5">
            <Tag className="h-5 w-5" />
          </div>
          <h4 className="text-xs font-bold text-foreground">No affiliate links yet</h4>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-0.5 mb-4">
            Add your product links and promo codes to track clicks and share with your audience.
          </p>
          {categories.length > 0 && (
            <div className="flex justify-center">
              <AddDealModal categories={categories} buttonLabel="Add My Affiliate" />
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {links.map((link) => {
            const isCopiedLink = copiedKey === `link-${link.id}`
            const isCopiedCode = copiedKey === `code-${link.id}`

            return (
              <div
                key={link.id}
                className="rounded-xl border border-border p-3.5 bg-card hover:bg-muted/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-foreground truncate">
                      {link.title || 'Untitled Affiliate Link'}
                    </span>
                    {link.promo_code && (
                      <button
                        type="button"
                        onClick={() => handleCopy(link.promo_code!, `code-${link.id}`)}
                        className="px-2 py-0.5 rounded-lg bg-[#FC801A]/10 hover:bg-[#FC801A]/20 text-[#FC801A] font-mono text-[11px] font-bold border border-[#FC801A]/20 inline-flex items-center gap-1 transition-colors cursor-pointer"
                        title="Click to copy promo code"
                      >
                        {isCopiedCode ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-500" />
                            <span className="text-emerald-500 font-sans font-semibold text-[10px]">Copied!</span>
                          </>
                        ) : (
                          <>
                            <span>CODE: {link.promo_code}</span>
                            <Copy className="h-2.5 w-2.5 opacity-60" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
                    {link.categories?.name && (
                      <span>{link.categories.name}</span>
                    )}
                    {link.categories?.name && <span>•</span>}
                    <span>{link.click_count || 0} clicks</span>
                    <span>•</span>
                    <span className="font-mono truncate max-w-[200px] sm:max-w-xs text-muted-foreground/80">
                      {link.product_url.replace(/^https?:\/\//, '')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* 1-Click Copy Link */}
                  <button
                    type="button"
                    onClick={() => handleCopy(link.product_url, `link-${link.id}`)}
                    className="h-8 px-2.5 rounded-lg border border-border bg-background hover:bg-muted font-medium text-xs text-foreground flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    title="Copy affiliate link"
                  >
                    {isCopiedLink ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-emerald-500 text-[11px] font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-[11px]">Copy link</span>
                      </>
                    )}
                  </button>

                  {/* Visit Link */}
                  <a
                    href={link.product_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-8 w-8 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors shadow-2xs"
                    title="Open link"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>

                  {/* Delete Button */}
                  <button
                    type="button"
                    disabled={deletingId === link.id}
                    onClick={() => handleDelete(link.id)}
                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center justify-center transition-colors cursor-pointer"
                    title="Remove affiliate link"
                  >
                    {deletingId === link.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
