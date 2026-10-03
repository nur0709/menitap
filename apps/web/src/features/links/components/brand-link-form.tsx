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
        <div className="p-3 text-sm text-rose-300 bg-rose-950/50 border border-rose-800/50 rounded-lg">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="brand_name" className="text-zinc-300 text-sm">Brand Name *</Label>
        <Input
          id="brand_name"
          name="brand_name"
          required
          placeholder="e.g. Glossier, Gymshark, Anker"
          className="bg-zinc-900 border-white/10 text-white placeholder:text-zinc-600 h-11"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="application_url" className="text-zinc-300 text-sm">Application / Collab Portal URL *</Label>
        <Input
          id="application_url"
          name="application_url"
          type="url"
          required
          placeholder="https://brand.com/collab or https://forms.gle/..."
          className="bg-zinc-900 border-white/10 text-white placeholder:text-zinc-600 h-11"
        />
        <p className="text-xs text-zinc-500">The direct link where UGC creators apply to receive products or brand deals.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="brand_category_id" className="text-zinc-300 text-sm">Category *</Label>
        <select
          id="brand_category_id"
          name="category_id"
          required
          className="w-full h-11 rounded-lg bg-zinc-900 border border-white/10 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="" disabled selected>Select category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id} className="bg-zinc-900 text-white">
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3 p-3.5 rounded-lg bg-zinc-900 border border-white/10">
        <input
          type="checkbox"
          id="products_provided"
          name="products_provided"
          defaultChecked
          className="h-4 w-4 rounded border-zinc-700 bg-zinc-950 text-purple-600 focus:ring-purple-500"
        />
        <Label htmlFor="products_provided" className="text-xs sm:text-sm text-zinc-300 cursor-pointer">
          Free products / gifting provided to approved UGC creators
        </Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="brand_description" className="text-zinc-300 text-sm">Collaboration Details (Optional)</Label>
        <textarea
          id="brand_description"
          name="description"
          rows={3}
          placeholder="What kind of content are they looking for? (e.g. TikTok unboxings, honest reviews, 30s Reels)"
          className="w-full rounded-lg bg-zinc-900 border border-white/10 p-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3.5 text-xs text-yellow-300/90">
        ⭐ <span className="font-semibold">Earn Points:</span> When your contributed brand link is reviewed and approved by admins, you will earn reward points redeemable for subscription discounts!
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium h-11 border-0"
      >
        {isPending ? 'Submitting...' : 'Submit Brand Opportunity'}
      </Button>
    </form>
  )
}
