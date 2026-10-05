'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createAffiliateLink } from '../actions'
import { Plus, X, Loader2, Link as LinkIcon, Tag } from 'lucide-react'

export type Category = {
  id: number
  name: string
  slug: string
}

export function AddDealModal({ categories }: { categories: Category[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPending) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isPending])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const res = await createAffiliateLink(null, formData)
      if (res.error) {
        setError(res.error)
      } else {
        setSuccess(true)
        setTimeout(() => {
          setIsOpen(false)
          setSuccess(false)
          router.refresh()
        }, 1000)
      }
    })
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="sm"
        className="bg-[#FC801A] hover:bg-[#E66F0D] text-white border-0 font-semibold shadow-xs cursor-pointer text-xs sm:text-sm px-4 h-9"
      >
        <Plus className="h-4 w-4 mr-1.5" />
        Post a Deal
      </Button>

      {isOpen && (
        <div
          onClick={() => !isPending && setIsOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl"
          >
            {/* Close */}
            <button
              onClick={() => !isPending && setIsOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="text-left mb-5">
              <div className="flex items-center gap-2 text-[#FC801A] mb-1">
                <Tag className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Creator Affiliate Link</span>
              </div>
              <h3 className="text-lg font-bold text-foreground">Post a Deal</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Share your affiliate link and discount code with shoppers.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-2.5 rounded-lg text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
                {error}
              </div>
            )}

            {success ? (
              <div className="p-6 text-center text-sm font-medium text-emerald-600 dark:text-emerald-400">
                ✓ Deal published successfully!
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Affiliate URL */}
                <div className="space-y-1.5 text-left">
                  <Label htmlFor="product_url" className="text-xs font-medium text-foreground">
                    Affiliate Link / URL *
                  </Label>
                  <div className="relative">
                    <LinkIcon className="h-3.5 w-3.5 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      id="product_url"
                      name="product_url"
                      required
                      placeholder="https://brand.com/deal or amzn.to/..."
                      className="pl-8 bg-background border-border text-xs h-9"
                    />
                  </div>
                </div>

                {/* Promo Code */}
                <div className="space-y-1.5 text-left">
                  <Label htmlFor="promo_code" className="text-xs font-medium text-foreground">
                    Promo / Discount Code (Optional)
                  </Label>
                  <Input
                    id="promo_code"
                    name="promo_code"
                    placeholder="e.g. SAVE20, CREATOR10"
                    className="bg-background border-border text-xs h-9 uppercase"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1.5 text-left">
                  <Label htmlFor="category_id" className="text-xs font-medium text-foreground">
                    Category *
                  </Label>
                  <select
                    id="category_id"
                    name="category_id"
                    required
                    defaultValue=""
                    className="w-full h-9 rounded-md bg-background border border-border px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-[#08739C]"
                  >
                    <option value="" disabled>Select deal category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-background text-foreground">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Optional Product Title */}
                <div className="space-y-1.5 text-left">
                  <Label htmlFor="title" className="text-xs font-medium text-foreground">
                    Product Title / Short Note (Optional)
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g. Wireless Headset or leave empty"
                    className="bg-background border-border text-xs h-9"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isPending}
                    onClick={() => setIsOpen(false)}
                    className="text-xs cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isPending}
                    className="bg-[#FC801A] hover:bg-[#E66F0D] text-white border-0 text-xs font-medium cursor-pointer"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                        Posting...
                      </>
                    ) : (
                      'Publish Deal'
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
