'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createBrandLink, type LinkActionState } from '../actions'

type Category = {
  id: number
  name: string
  slug: string
}

export function BrandLinkForm({ categories }: { categories: Category[] }) {
  const [state, formAction, isPending] = useActionState<LinkActionState, FormData>(
    createBrandLink,
    {}
  )

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="brand_name" className="text-foreground text-sm font-medium">Brand Name *</Label>
        <Input
          id="brand_name"
          name="brand_name"
          required
          placeholder="e.g. Glossier, Gymshark, Anker"
          className="bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-[#FC801A] h-11"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="application_url" className="text-foreground text-sm font-medium">Application / Collab Portal URL *</Label>
        <Input
          id="application_url"
          name="application_url"
          type="url"
          required
          placeholder="https://brand.com/collab or https://forms.gle/..."
          className="bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-[#FC801A] h-11"
        />
        <p className="text-xs text-muted-foreground">The direct link where UGC creators apply to receive products or brand deals.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="brand_category_id" className="text-foreground text-sm font-medium">Category *</Label>
        <select
          id="brand_category_id"
          name="category_id"
          required
          defaultValue=""
          className="w-full h-11 rounded-lg bg-background border border-border px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#FC801A]"
        >
          <option value="" disabled>Select category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id} className="bg-background text-foreground">
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3 p-3.5 rounded-lg bg-muted/50 border border-border">
        <input
          type="checkbox"
          id="products_provided"
          name="products_provided"
          defaultChecked
          className="h-4 w-4 rounded border-border text-[#FC801A] focus:ring-[#FC801A]"
        />
        <Label htmlFor="products_provided" className="text-xs sm:text-sm text-foreground cursor-pointer">
          Free products / gifting provided to approved UGC creators
        </Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="brand_description" className="text-foreground text-sm font-medium">Collaboration Details (Optional)</Label>
        <textarea
          id="brand_description"
          name="description"
          rows={3}
          placeholder="What kind of content are they looking for? (e.g. TikTok unboxings, honest reviews, 30s Reels)"
          className="w-full rounded-lg bg-background border border-border p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#FC801A]"
        />
      </div>

      <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3.5 text-xs text-amber-700 dark:text-amber-300">
        ⭐ <span className="font-semibold">Earn Points:</span> When your contributed brand link is reviewed and approved by admins, you will earn reward points redeemable for subscription discounts!
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-[#FC801A] hover:bg-[#E66F0D] text-white font-medium h-11 border-0 shadow-sm transition-all"
      >
        {isPending ? 'Submitting...' : 'Submit Brand Collaboration'}
      </Button>
    </form>
  )
}
