'use client'

import { useState, useTransition } from 'react'
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
        window.location.reload()
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
        window.location.reload()
      }
    })
  }

  const tabLabels = {
    DEALS: 'Explore Deals',
    CREATORS: 'Campaign Links',
    BRANDS: 'Explore Creators',
  }

  return (
    <div className="w-full pt-6 border-t border-destructive/20 mt-6 text-left">
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="h-4 w-4 text-destructive" />
          <span className="text-xs font-bold uppercase tracking-wider text-destructive">
            Admin Category Manager
          </span>
        </div>

        <p className="text-xs text-muted-foreground mb-4">
          Add or remove categories for each tab across Menitap:
        </p>

        {/* Tab Selector */}
        <div className="flex flex-wrap gap-1.5 mb-4 border-b border-border/60 pb-3">
          {(['DEALS', 'CREATORS', 'BRANDS'] as const).map((tab) => (
            <Button
              key={tab}
              type="button"
              size="sm"
              variant={activeTab === tab ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab)}
              className={`text-xs h-7 cursor-pointer ${
                activeTab === tab
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90 border-0'
                  : 'border-border text-foreground'
              }`}
            >
              {tabLabels[tab]}
            </Button>
          ))}
        </div>

        {error && (
          <div className="mb-3 p-2 rounded-lg text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
            {error}
          </div>
        )}

        {/* Existing Categories for Tab */}
        <div className="flex flex-wrap gap-2 mb-4">
          {filteredCategories.length === 0 ? (
            <span className="text-xs text-muted-foreground italic">No categories yet in this tab.</span>
          ) : (
            filteredCategories.map((cat) => (
              <Badge
                key={cat.id}
                variant="outline"
                className="px-2.5 py-1 text-xs bg-background border-border flex items-center gap-1.5"
              >
                <span>{cat.name}</span>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                  title="Remove category"
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
            className="h-8 text-xs bg-background border-border text-foreground flex-1"
          />
          <Button
            type="submit"
            size="sm"
            disabled={isPending || !newCatName.trim()}
            className="h-8 px-3 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90 border-0 cursor-pointer shrink-0"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <FolderPlus className="h-3.5 w-3.5 mr-1" />
                Add Category
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
