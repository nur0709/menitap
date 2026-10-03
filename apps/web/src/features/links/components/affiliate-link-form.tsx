'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createAffiliateLink, type LinkActionState } from '../actions'

type Category = {
  id: number
  name: string
  slug: string
}

export function AffiliateLinkForm({ categories }: { categories: Category[] }) {
  const [state, formAction, isPending] = useActionState<LinkActionState, FormData>(
    createAffiliateLink,
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
        <Label htmlFor="title" className="text-zinc-300 text-sm">Product Title *</Label>
        <Input
          id="title"
          name="title"
          required
          placeholder="e.g. Sony ZV-E10 Creator Camera"
          className="bg-zinc-900 border-white/10 text-white placeholder:text-zinc-600 h-11"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="product_url" className="text-zinc-300 text-sm">Affiliate / Product URL *</Label>
        <Input
          id="product_url"
          name="product_url"
          type="url"
          required
          placeholder="https://amazon.com/... or https://brand.com/ref/..."
          className="bg-zinc-900 border-white/10 text-white placeholder:text-zinc-600 h-11"
        />
        <p className="text-xs text-zinc-500">Include your affiliate tracking tag if you have one.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category_id" className="text-zinc-300 text-sm">Category *</Label>
          <select
            id="category_id"
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

        <div className="space-y-2">
          <Label htmlFor="discount_percentage" className="text-zinc-300 text-sm">Discount % (Optional)</Label>
          <Input
            id="discount_percentage"
            name="discount_percentage"
            type="number"
            min="0"
            max="100"
            placeholder="e.g. 20"
            className="bg-zinc-900 border-white/10 text-white placeholder:text-zinc-600 h-11"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="promo_code" className="text-zinc-300 text-sm">Promo Code (Optional)</Label>
        <Input
          id="promo_code"
          name="promo_code"
          placeholder="e.g. CREATOR20"
          className="bg-zinc-900 border-white/10 text-white placeholder:text-zinc-600 h-11"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-zinc-300 text-sm">Short Description (Optional)</Label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="What makes this deal or product great for shoppers?"
          className="w-full rounded-lg bg-zinc-900 border border-white/10 p-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div className="rounded-lg bg-white/5 border border-white/10 p-3.5 text-xs text-zinc-400">
        🛡️ <span className="font-semibold text-zinc-300">Moderation policy:</span> All submitted affiliate links are initially marked as <span className="text-yellow-400 font-medium">Pending Review</span> and become public once approved by our team.
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium h-11 border-0"
      >
        {isPending ? 'Submitting...' : 'Submit Affiliate Deal'}
      </Button>
    </form>
  )
}
