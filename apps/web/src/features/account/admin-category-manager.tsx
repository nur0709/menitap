'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { addCategory, deleteCategory } from '@/features/links/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { FolderPlus, Trash2, Loader2, Layers } from 'lucide-react'

export interface CategoryItem {
  id: number
  name: string
  slug: string
  type: string
}

export function AdminCategoryManager({ categories }: { categories: CategoryItem[] }) {
  const [activeTab, setActiveTab] = useState<'DEALS' | 'CREATORS' | 'BRANDS'>('DEALS')
  const [newCatName, setNewCatName] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const filteredCategories = categories.filter((c) => (c.type || 'DEALS') === activeTab)

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatName.trim()) return
    setError(null)

    startTransition(async () => {
      const res = await addCategory(newCatName.trim(), activeTab)
      if (res.error) {
        setError(res.error)
      } else {
        setNewCatName('')
        router.refresh()
      }
    })
  }

  const handleDeleteCategory = (id: number) => {
    setError(null)
    startTransition(async () => {
      const res = await deleteCategory(id)
      if (res.error) {
        setError(res.error)
      } else {
        router.refresh()
      }
    })
  }

  const tabLabels: Record<'DEALS' | 'CREATORS' | 'BRANDS', string> = {
    DEALS: 'Deals',
    CREATORS: 'Brand Collabs',
    BRANDS: 'Creators',
  }

  const tabDescriptions: Record<'DEALS' | 'CREATORS' | 'BRANDS', string> = {
    DEALS: 'Active filter categories displayed across the Deals page (/deals).',
    CREATORS: 'Categories displayed on the Brand Collabs board (/collabs) and submission form (/post-collab).',
    BRANDS: 'Creator category tags displayed on the Creators directory (/creators).',
  }

  return (
    <div className="w-full text-left">
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8]" />
          <h3 className="text-sm font-bold text-foreground">
            Category Taxonomy Manager
          </h3>
        </div>

        <p className="text-xs text-muted-foreground mb-5">
          Dynamically add or remove categories for each section across Menitap without code changes:
        </p>

        {/* Tab Selector */}
        <div className="flex flex-wrap gap-2 mb-3 border-b border-border/70 pb-3">
          {(['DEALS', 'CREATORS', 'BRANDS'] as const).map((tab) => (
            <Button
              key={tab}
              type="button"
              size="sm"
              variant={activeTab === tab ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab)}
              className={`text-xs h-8 cursor-pointer font-medium transition-all ${
                activeTab === tab
                  ? 'bg-foreground text-background shadow-xs font-bold'
                  : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {tabLabels[tab]}
            </Button>
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground mb-4 italic">
          {tabDescriptions[activeTab]}
        </p>

        {error && (
          <div className="mb-4 p-2.5 rounded-lg text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
            {error}
          </div>
        )}

        {/* Existing Categories for Tab */}
        <div className="flex flex-wrap gap-2 mb-5">
          {filteredCategories.length === 0 ? (
            <span className="text-xs text-muted-foreground italic py-1">
              No categories configured for {tabLabels[activeTab]} yet.
            </span>
          ) : (
            filteredCategories.map((cat) => (
              <Badge
                key={cat.id}
                variant="outline"
                className="px-2.5 py-1 text-xs bg-muted/50 border-border text-foreground flex items-center gap-1.5 shadow-2xs hover:border-foreground/30 transition-colors"
              >
                <span>{cat.name}</span>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer p-0.5 rounded-xs"
                  title={`Remove ${cat.name}`}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </Badge>
            ))
          )}
        </div>

        {/* Add New Category Form */}
        <form onSubmit={handleAddCategory} className="flex gap-2">
          <Input
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder={`Add new category for ${tabLabels[activeTab]}...`}
            className="h-9 text-xs bg-background border-border text-foreground flex-1"
          />
          <Button
            type="submit"
            size="sm"
            disabled={isPending || !newCatName.trim()}
            className="h-9 px-3.5 text-xs bg-[#08739C] hover:bg-[#02547A] text-white font-medium cursor-pointer shrink-0 transition-colors"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <FolderPlus className="h-3.5 w-3.5 mr-1.5" />
                Add Category
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
