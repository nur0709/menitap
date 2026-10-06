'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { submitPublicBrandCampaign } from '@/features/links/actions'
import { type Category } from '@/features/links/components/add-campaign-modal'
import { Loader2, Link as LinkIcon, Building2, Package, CheckCircle2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface PostCollabFormProps {
  categories: Category[]
  defaultCategorySlug?: string
}

export function PostCollabForm({ categories, defaultCategorySlug }: PostCollabFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isParsing, setIsParsing] = useState(false)

  // Form field state for smart autofill
  const [applicationUrl, setApplicationUrl] = useState('')
  const [brandName, setBrandName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [description, setDescription] = useState('')
  const [compensationDetails, setCompensationDetails] = useState('Free Product to test & keep')
  const [productsProvided, setProductsProvided] = useState(true)

  // Initial category selection
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
          if (data.brandName && !brandName) {
            setBrandName(data.brandName)
          }
          if (data.description && !description) {
            setDescription(data.description)
          } else if (data.title && !description) {
            setDescription(data.title)
          }

          if (data.compensationType === 'PAID') {
            setCompensationDetails('Paid UGC Sponsorship')
          } else if (data.compensationType === 'COMMISSION') {
            setCompensationDetails('Affiliate Commission + Samples')
          }

          if (data.suggestedCategory && !categoryId) {
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
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          Thank you for sharing your collaboration. Our team verifies submissions to ensure genuine brand opportunities before publishing to all creators on Menitap.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/collabs"
            className="inline-flex items-center gap-1.5 px-4 h-9 rounded-lg bg-[#FC801A] hover:bg-[#E66F0D] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <span>View Collabs Feed</span>
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
            Submit Another Campaign
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-xs text-left">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-[#08739C] dark:text-[#38BDF8] mb-1">
          <Building2 className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Free Campaign Placement</span>
        </div>
        <h2 className="text-xl font-bold text-foreground">Brand Details & Brief</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Fill out the brief below or paste your application link to autofill information.
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-xl text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Collab / Application Link */}
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
              placeholder="https://brand.com/collab, forms.gle/..., or collabs.shopify.com/..."
              className="pl-8 bg-background border-border text-xs h-9"
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Paste your Google Form, Typeform, Shopify Collabs, or website intake form.
          </p>
        </div>

        {/* 2-Column Brand Name + Work Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div className="space-y-1.5">
            <Label htmlFor="contact_email" className="text-xs font-medium text-foreground">
              Brand Contact / Work Email *
            </Label>
            <Input
              id="contact_email"
              name="contact_email"
              type="email"
              required
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="collabs@yourbrand.com"
              className="bg-background border-border text-xs h-9"
            />
          </div>
        </div>

        {/* 2-Column Category + Compensation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="category_id" className="text-xs font-medium text-foreground">
              Category / Niche *
            </Label>
            <select
              id="category_id"
              name="category_id"
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full h-9 rounded-md bg-background border border-border px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-[#08739C]"
            >
              <option value="" disabled>Select niche category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-background text-foreground">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="compensation_details" className="text-xs font-medium text-foreground">
              Compensation / Creator Perks
            </Label>
            <Input
              id="compensation_details"
              name="compensation_details"
              value={compensationDetails}
              onChange={(e) => setCompensationDetails(e.target.value)}
              placeholder="e.g. Free Product + $100 / video, Gifting only"
              className="bg-background border-border text-xs h-9"
            />
          </div>
        </div>

        {/* Campaign Description */}
        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-xs font-medium text-foreground">
            Campaign Brief / What kind of content are you looking for? (Optional)
          </Label>
          <Input
            id="description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Looking for authentic 30s TikTok reviews and unboxing videos"
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
            <span>Free products or PR samples provided to creators to keep</span>
          </Label>
        </div>

        <div className="pt-3">
          <Button
            type="submit"
            disabled={isPending || isParsing}
            className="w-full bg-[#FC801A] hover:bg-[#E66F0D] text-white border-0 text-xs sm:text-sm font-semibold h-10 shadow-xs cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                Submitting Campaign...
              </>
            ) : (
              'Submit Campaign for Free'
            )}
          </Button>
          <p className="text-[11px] text-center text-muted-foreground mt-2">
            No upfront fees or credit card required. Reviewed and published within 24 hours.
          </p>
        </div>
      </form>
    </div>
  )
}
