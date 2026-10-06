'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createAffiliateLink } from '../actions'
import { Plus, X, Loader2, Link as LinkIcon, Tag } from 'lucide-react'
import { matchCategory } from '@/lib/category-matcher'

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
  const [isParsing, setIsParsing] = useState(false)

  // Form field state for smart autofill
  const [productUrl, setProductUrl] = useState('')
  const [promoCode, setPromoCode] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [title, setTitle] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [parseSource, setParseSource] = useState<'ai_gemini' | 'ai_groq' | 'opengraph' | null>(null)

  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPending && !isParsing) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isPending, isParsing])

  // Smart Autofill when URL changes
  const handleAutoFill = async (urlToParse: string) => {
    if (!urlToParse || urlToParse.trim().length < 8) return

    setIsParsing(true)
    try {
      const res = await fetch('/api/extract-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToParse.trim() }),
      })

      if (res.ok) {
        const json = await res.json()
        if (json.data) {
          const data = json.data
          setParseSource(data.source || 'opengraph')
          if (data.title) {
            setTitle(data.title)
          } else if (data.brandName) {
            setTitle(`${data.brandName} Deal`)
          }

          const resolvedImg = data.imageUrl || data.logoUrl
          if (resolvedImg) {
            setImageUrl(resolvedImg)
          }

          const matched = matchCategory(
            data.suggestedCategory || data.brandName || data.title,
            categories
          )
          if (matched) {
            setCategoryId(String(matched.id))
          }
        }
      }
    } catch (err) {
      console.warn('Autofill error:', err)
    } finally {
      setIsParsing(false)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData()
    formData.append('product_url', productUrl)
    formData.append('promo_code', promoCode)
    formData.append('category_id', categoryId)
    formData.append('title', title)
    if (imageUrl) {
      formData.append('image_url', imageUrl)
    }

    startTransition(async () => {
      const res = await createAffiliateLink(null, formData)
      if (res.error) {
        setError(res.error)
      } else {
        setSuccess(true)
        setTimeout(() => {
          setIsOpen(false)
          setSuccess(false)
          setProductUrl('')
          setPromoCode('')
          setCategoryId('')
          setTitle('')
          setImageUrl('')
          router.refresh()
        }, 800)
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl">
            {/* Close */}
            <button
              onClick={() => !isPending && !isParsing && setIsOpen(false)}
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="product_url" className="text-xs font-medium text-foreground">
                      Affiliate Link / URL *
                    </Label>
                    {isParsing && (
                      <span className="text-[11px] font-medium text-[#FC801A] flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Autofilling...
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <LinkIcon className="h-3.5 w-3.5 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      id="product_url"
                      name="product_url"
                      required
                      value={productUrl}
                      onChange={(e) => setProductUrl(e.target.value)}
                      onBlur={() => handleAutoFill(productUrl)}
                      placeholder="https://brand.com/deal or amzn.to/..."
                      className="pl-8 bg-background border-border text-xs h-9"
                    />
                  </div>
                  {parseSource && (
                    <div className="flex items-center gap-1.5 pt-0.5">
                      {parseSource.startsWith('ai') ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                          ✨ AI Extracted ({parseSource === 'ai_gemini' ? 'Gemini' : 'Groq'})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full border border-border">
                          🌐 Page Metadata Extracted
                        </span>
                      )}
                    </div>
                  )}
                  {imageUrl && (
                    <div className="flex items-center gap-2.5 p-2 rounded-xl bg-muted/40 border border-border mt-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl}
                        alt="Product preview"
                        referrerPolicy="no-referrer"
                        className="h-10 w-10 rounded-lg object-cover border border-border shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-medium text-foreground block truncate">
                          {title || 'Product Image Preview'}
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          ✓ Visual Preview Attached
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="text-[10px] text-muted-foreground hover:text-destructive px-1.5 py-0.5 rounded cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Promo Code */}
                <div className="space-y-1.5 text-left">
                  <Label htmlFor="promo_code" className="text-xs font-medium text-foreground">
                    Promo / Discount Code (Optional)
                  </Label>
                  <Input
                    id="promo_code"
                    name="promo_code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
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
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
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
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Wireless Headset or leave empty"
                    className="bg-background border-border text-xs h-9"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isPending || isParsing}
                    onClick={() => setIsOpen(false)}
                    className="text-xs cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isPending || isParsing}
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
