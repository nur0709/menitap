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
        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title" className="text-foreground text-sm font-medium">Product Title *</Label>
        <Input
          id="title"
          name="title"
          required
          placeholder="e.g. Sony ZV-E10 Creator Camera"
          className="bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-[#08739C] h-11"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="product_url" className="text-foreground text-sm font-medium">Affiliate / Product URL *</Label>
        <Input
          id="product_url"
          name="product_url"
          type="url"
          required
          placeholder="https://amazon.com/... or https://brand.com/ref/..."
          className="bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-[#08739C] h-11"
        />
        <p className="text-xs text-muted-foreground">Include your affiliate tracking tag if you have one.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category_id" className="text-foreground text-sm font-medium">Category *</Label>
          <select
            id="category_id"
            name="category_id"
            required
            defaultValue=""
            className="w-full h-11 rounded-lg bg-background border border-border px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#08739C]"
          >
            <option value="" disabled>Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id} className="bg-background text-foreground">
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="discount_percentage" className="text-foreground text-sm font-medium">Discount % (Optional)</Label>
          <Input
            id="discount_percentage"
            name="discount_percentage"
            type="number"
            min="0"
            max="100"
            placeholder="e.g. 20"
            className="bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-[#08739C] h-11"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="promo_code" className="text-foreground text-sm font-medium">Promo Code (Optional)</Label>
        <Input
          id="promo_code"
          name="promo_code"
          placeholder="e.g. CREATOR20"
          className="bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-[#08739C] h-11"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-foreground text-sm font-medium">Short Description (Optional)</Label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="What makes this deal or product great for shoppers?"
          className="w-full rounded-lg bg-background border border-border p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#08739C]"
        />
      </div>

      <div className="rounded-lg bg-muted/60 border border-border p-3.5 text-xs text-muted-foreground">
        🛡️ <span className="font-semibold text-foreground">Moderation policy:</span> All submitted affiliate links are initially marked as <span className="text-amber-600 dark:text-amber-300 font-medium">Pending Review</span> and become public once approved by our team.
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-[#08739C] hover:bg-[#02547A] text-white font-medium h-11 border-0 shadow-sm transition-all"
      >
        {isPending ? 'Submitting...' : 'Submit Affiliate Deal'}
      </Button>
    </form>
  )
}
