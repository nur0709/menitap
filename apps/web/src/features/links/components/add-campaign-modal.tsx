'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createBrandLink } from '../actions'
import { Plus, X, Loader2, Link as LinkIcon, Building2, Package } from 'lucide-react'

export type Category = {
  id: number
  name: string
  slug: string
}

export function AddCampaignModal({ categories }: { categories: Category[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isParsing, setIsParsing] = useState(false)

  // Form field state for smart autofill
  const [applicationUrl, setApplicationUrl] = useState('')
  const [brandName, setBrandName] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [productsProvided, setProductsProvided] = useState(true)
  const [imageUrl, setImageUrl] = useState('')

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
          if (data.brandName) {
            setBrandName(data.brandName)
          }
          if (data.description) {
            setDescription(data.description)
          } else if (data.title) {
            setDescription(data.title)
          }

          if (data.logoUrl || data.imageUrl) {
            setImageUrl(data.logoUrl || data.imageUrl)
          }

          // Match category if suggested
          if (data.suggestedCategory) {
            const matched = categories.find(
              (c) => c.name.toLowerCase() === data.suggestedCategory.toLowerCase()
            )
            if (matched) {
              setCategoryId(String(matched.id))
            }
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
    formData.append('brand_name', brandName)
    formData.append('application_url', applicationUrl)
    formData.append('category_id', categoryId)
    formData.append('description', description)
    if (productsProvided) {
      formData.append('products_provided', 'on')
    }
    if (imageUrl) {
      formData.append('image_url', imageUrl)
    }

    startTransition(async () => {
      const res = await createBrandLink(null, formData)
      if (res.error) {
        setError(res.error)
      } else {
        setSuccess(true)
        setTimeout(() => {
          setIsOpen(false)
          setSuccess(false)
          setApplicationUrl('')
          setBrandName('')
          setDescription('')
          setCategoryId('')
          setImageUrl('')
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
        Post Campaign
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl text-left">
            {/* Close */}
            <button
              onClick={() => !isPending && !isParsing && setIsOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="mb-5">
              <div className="flex items-center gap-2 text-[#08739C] dark:text-[#38BDF8] mb-1">
                <Building2 className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Brand Collaboration</span>
              </div>
              <h3 className="text-lg font-bold text-foreground">Post a Campaign Link</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Paste any collab link — our system autofills brand info and details.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-2.5 rounded-lg text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
                {error}
              </div>
            )}

            {success ? (
              <div className="p-6 text-center text-sm font-medium text-emerald-600 dark:text-emerald-400">
                ✓ Campaign link published successfully!
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Collab Link / Application URL */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="application_url" className="text-xs font-medium text-foreground">
                      Collab Link / Application URL *
                    </Label>
                    {isParsing && (
                      <span className="text-[11px] font-medium text-[#FC801A] flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Autofilling details...
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <LinkIcon className="h-3.5 w-3.5 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      id="application_url"
                      name="application_url"
                      required
                      value={applicationUrl}
                      onChange={(e) => setApplicationUrl(e.target.value)}
                      onBlur={() => handleAutoFill(applicationUrl)}
                      placeholder="https://brand.com/collab or forms.gle/..."
                      className="pl-8 bg-background border-border text-xs h-9"
                    />
                  </div>
                  {imageUrl && (
                    <div className="flex items-center gap-2.5 p-2 rounded-xl bg-muted/40 border border-border mt-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl}
                        alt="Brand preview"
                        referrerPolicy="no-referrer"
                        className="h-10 w-10 rounded-lg object-contain bg-card border border-border shrink-0 p-1"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-medium text-foreground block truncate">
                          {brandName || 'Brand Visual Preview'}
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          ✓ Brand Art Attached
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

                {/* Brand Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="brand_name" className="text-xs font-medium text-foreground">
                    Brand / Company Name *
                  </Label>
                  <Input
                    id="brand_name"
                    name="brand_name"
                    required
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="e.g. Glossier, Anker, Gymshark"
                    className="bg-background border-border text-xs h-9"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1.5">
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
                    <option value="" disabled>Select campaign category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-background text-foreground">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-xs font-medium text-foreground">
                    Campaign Details / What are you looking for? (Optional)
                  </Label>
                  <Input
                    id="description"
                    name="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. 30s TikTok video reviewing our skincare serum"
                    className="bg-background border-border text-xs h-9"
                  />
                </div>

                {/* Free Products Provided Checkbox */}
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-muted/30 border border-border">
                  <input
                    type="checkbox"
                    id="products_provided"
                    name="products_provided"
                    checked={productsProvided}
                    onChange={(e) => setProductsProvided(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-[#08739C] focus:ring-[#08739C]"
                  />
                  <Label htmlFor="products_provided" className="text-xs text-foreground font-medium cursor-pointer flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5 text-[#08739C]" />
                    <span>Free products provided for creator reviews</span>
                  </Label>
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
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                        Posting...
                      </>
                    ) : (
                      'Publish Campaign'
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
