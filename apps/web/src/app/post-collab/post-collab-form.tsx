'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { submitPublicBrandCampaign } from '@/features/links/actions'
import { type Category } from '@/features/links/components/add-campaign-modal'
import { Loader2, Link as LinkIcon, Package, CheckCircle2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface PostCollabFormProps {
  categories: Category[]
  defaultCategorySlug?: string
  userEmail?: string
}

export function PostCollabForm({
  categories,
  defaultCategorySlug,
  userEmail,
}: PostCollabFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isParsing, setIsParsing] = useState(false)

  // Form field state for smart autofill
  const [applicationUrl, setApplicationUrl] = useState('')
  const [brandName, setBrandName] = useState('')
  const [contactEmail, setContactEmail] = useState(userEmail || '')
  const [description, setDescription] = useState('')
  const [compensationDetails, setCompensationDetails] = useState('')
  const [productsProvided, setProductsProvided] = useState(true)
  const [imageUrl, setImageUrl] = useState('')
  const [parseSource, setParseSource] = useState<'ai_gemini' | 'ai_groq' | 'opengraph' | null>(null)

  const defaultCat = categories.find((c) => c.slug === defaultCategorySlug)
  const [categoryId, setCategoryId] = useState(defaultCat ? String(defaultCat.id) : '')

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

          if (data.compensationType === 'PAID') {
            setCompensationDetails('Paid Sponsorship')
          } else if (data.compensationType === 'COMMISSION') {
            setCompensationDetails('Commission + Samples')
          }

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
    formData.append('contact_email', contactEmail)
    formData.append('application_url', applicationUrl)
    formData.append('category_id', categoryId)
    formData.append('description', description)
    formData.append('compensation_details', compensationDetails)
    if (productsProvided) {
      formData.append('products_provided', 'on')
    }
    if (imageUrl) {
      formData.append('image_url', imageUrl)
    }

    startTransition(async () => {
      const res = await submitPublicBrandCampaign(null, formData)
      if (res.error) {
        setError(res.error)
      } else {
        setSuccess(true)
      }
    })
  }

  if (success) {
    return (
      <div className="p-8 sm:p-10 rounded-2xl bg-card border border-border text-center shadow-xs space-y-4">
        <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="text-xl font-bold text-foreground">Campaign Submitted!</h3>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
          Thanks for sharing your collab. It will be verified and published to creators within 24 hours.
        </p>
        <p className="text-[11px] text-muted-foreground/80 max-w-sm mx-auto">
          Need to update or remove your collab? You can delete it from your account or contact team@menitap.com.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/collabs"
            className="inline-flex items-center gap-1.5 px-4 h-9 rounded-lg bg-[#FC801A] hover:bg-[#E66F0D] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <span>View Collabs</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => {
              setSuccess(false)
              setApplicationUrl('')
              setBrandName('')
              setDescription('')
            }}
            className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline cursor-pointer"
          >
            Submit Another
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-xs text-left">
      {error && (
        <div className="mb-4 p-3 rounded-xl text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campaign URL */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="application_url" className="text-xs font-medium text-foreground">
              Campaign or Application Link *
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
              id="application_url"
              name="application_url"
              required
              value={applicationUrl}
              onChange={(e) => setApplicationUrl(e.target.value)}
              onBlur={() => handleAutoFill(applicationUrl)}
              placeholder="https://brand.com/collab, forms.gle/..., or collabs.shopify.com/..."
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

        {/* 2-Column: Brand Name + Work Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <Label htmlFor="brand_name" className="text-xs font-medium text-foreground">
              Brand Name *
            </Label>
            <Input
              id="brand_name"
              name="brand_name"
              required
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="e.g. Glossier, Anker"
              className="bg-background border-border text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="contact_email" className="text-xs font-medium text-foreground">
                Contact Email *
              </Label>
              {userEmail && (
                <span className="text-[10px] text-muted-foreground font-normal">
                  (Account email)
                </span>
              )}
            </div>
            <Input
              id="contact_email"
              name="contact_email"
              type="email"
              required
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="collabs@brand.com"
              className="bg-background border-border text-xs h-9"
            />
          </div>
        </div>

        {/* 2-Column: Category + Compensation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
              <option value="" disabled>Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-background text-foreground">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="compensation_details" className="text-xs font-medium text-foreground">
              Perks / Compensation
            </Label>
            <Input
              id="compensation_details"
              name="compensation_details"
              value={compensationDetails}
              onChange={(e) => setCompensationDetails(e.target.value)}
              placeholder="e.g. Free Product, $100 / video"
              className="bg-background border-border text-xs h-9"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-xs font-medium text-foreground">
            What content are you looking for? (Optional)
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

        {/* Products Provided Checkbox */}
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30 border border-border">
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

        <div className="pt-2">
          <Button
            type="submit"
            disabled={isPending || isParsing}
            className="w-full bg-[#FC801A] hover:bg-[#E66F0D] text-white border-0 text-xs sm:text-sm font-semibold h-10 shadow-xs cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                Publishing...
              </>
            ) : (
              'Publish Collab'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
