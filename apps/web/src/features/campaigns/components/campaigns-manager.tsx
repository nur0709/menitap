'use client'

import { useState, useMemo, useTransition } from 'react'
import {
  CreatorCampaign,
  CanonicalCampaignStatus,
  normalizeCampaignStatus,
} from '../types'
import { CampaignCard } from './campaign-card'
import { AddCampaignManualModal } from './add-campaign-manual-modal'
import { bulkDeleteCampaigns } from '../actions'
import { Search, Inbox, Heart, Trash2, CheckSquare, X, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { GoogleSyncCard } from '@/features/integrations/google/components/google-sync-card'
import { GoogleIntegrationStatus } from '@/features/integrations/google/actions'

interface CampaignsManagerProps {
  campaigns: CreatorCampaign[]
  googleIntegration?: GoogleIntegrationStatus
  userName?: string
  userEmail?: string
}

export function CampaignsManager({
  campaigns,
  googleIntegration,
  userName,
  userEmail,
}: CampaignsManagerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'FAVORITES' | CanonicalCampaignStatus
  >('ALL')

  // Multiselect state
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isDeleting, startDeleteTransition] = useTransition()

  // Filtered campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      // Favorites filter
      if (statusFilter === 'FAVORITES') {
        if (!c.is_liked) return false
      } else if (statusFilter !== 'ALL') {
        if (normalizeCampaignStatus(c.status) !== statusFilter) {
          return false
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchBrand = c.brand_name.toLowerCase().includes(q)
        const matchProduct = c.product_name?.toLowerCase().includes(q)
        const matchDeliverables = c.deliverables?.toLowerCase().includes(q)
        if (!matchBrand && !matchProduct && !matchDeliverables) {
          return false
        }
      }
      return true
    })
  }, [campaigns, statusFilter, searchQuery])

  // Filter counts
  const filterCounts = useMemo(() => {
    const counts = {
      ALL: campaigns.length,
      FAVORITES: 0,
      APPLIED: 0,
      WAITING_PRODUCT: 0,
      SUBMITTED: 0,
      PAYMENT_PENDING: 0,
      PAID: 0,
      DECLINED: 0,
    }

    for (const c of campaigns) {
      if (c.is_liked) counts.FAVORITES++
      const norm = normalizeCampaignStatus(c.status)
      if (norm in counts) {
        counts[norm as keyof typeof counts]++
      }
    }

    return counts
  }, [campaigns])

  // Multiselect handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleSelectAll = () => {
    setSelectedIds(new Set(filteredCampaigns.map((c) => c.id)))
  }

  const handleDeselectAll = () => {
    setSelectedIds(new Set())
  }

  const handleExitSelectionMode = () => {
    setIsSelectionMode(false)
    setSelectedIds(new Set())
  }

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return
    const count = selectedIds.size
    if (confirm(`Delete ${count} selected brand deal${count > 1 ? 's' : ''}?`)) {
      startDeleteTransition(async () => {
        await bulkDeleteCampaigns(Array.from(selectedIds))
        handleExitSelectionMode()
      })
    }
  }

  return (
    <div className="space-y-5">
      {/* Minimal Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-3 flex-wrap">
          {googleIntegration && <GoogleSyncCard initialStatus={googleIntegration} />}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-48">
            <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search campaigns..."
              className="pl-8 bg-background border-border text-xs h-8 rounded-xl"
            />
          </div>

          {/* Toggle Select Mode Button */}
          {campaigns.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (isSelectionMode) {
                  handleExitSelectionMode()
                } else {
                  setIsSelectionMode(true)
                }
              }}
              className={`inline-flex items-center gap-1.5 px-3 h-8 rounded-xl text-xs font-semibold border transition-colors cursor-pointer shrink-0 ${
                isSelectionMode
                  ? 'border-[#FC801A] bg-[#FC801A]/10 text-[#FC801A] hover:bg-[#FC801A]/20'
                  : 'border-border bg-background hover:bg-muted text-foreground'
              }`}
            >
              <CheckSquare className="h-3.5 w-3.5" />
              <span>{isSelectionMode ? 'Done' : 'Select'}</span>
            </button>
          )}

          {!isSelectionMode && <AddCampaignManualModal />}
        </div>
      </div>

      {/* Floating or Inline Selection Action Bar */}
      {isSelectionMode && (
        <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-muted/60 border border-border shadow-xs text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="font-bold text-foreground">
              {selectedIds.size} of {filteredCampaigns.length} selected
            </span>
            <span className="text-border">|</span>
            <button
              type="button"
              onClick={selectedIds.size === filteredCampaigns.length ? handleDeselectAll : handleSelectAll}
              className="text-xs text-muted-foreground hover:text-foreground font-medium underline underline-offset-2 cursor-pointer"
            >
              {selectedIds.size === filteredCampaigns.length ? 'Deselect all' : 'Select all'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={selectedIds.size === 0 || isDeleting}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
            >
              {isDeleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              <span>Delete ({selectedIds.size})</span>
            </button>

            <button
              type="button"
              onClick={handleExitSelectionMode}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer transition-colors"
              title="Cancel selection"
              aria-label="Cancel selection"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer text-xs whitespace-nowrap ${
            statusFilter === 'ALL'
              ? 'bg-foreground text-background font-bold shadow-2xs'
              : 'bg-muted/60 text-muted-foreground hover:text-foreground'
          }`}
        >
          All ({filterCounts.ALL})
        </button>

        {filterCounts.FAVORITES > 0 && (
          <button
            onClick={() => setStatusFilter('FAVORITES')}
            className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer text-xs whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'FAVORITES'
                ? 'bg-rose-500 text-white font-bold shadow-2xs'
                : 'bg-muted/60 text-muted-foreground hover:text-foreground'
            }`}
          >
            <Heart
              className={`h-3 w-3 ${statusFilter === 'FAVORITES' ? 'fill-white' : 'fill-rose-500 text-rose-500'}`}
            />
            <span>Favorites ({filterCounts.FAVORITES})</span>
          </button>
        )}

        <button
          onClick={() => setStatusFilter('APPLIED')}
          className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer text-xs whitespace-nowrap ${
            statusFilter === 'APPLIED'
              ? 'bg-foreground text-background font-bold shadow-2xs'
              : 'bg-muted/60 text-muted-foreground hover:text-foreground'
          }`}
        >
          Applied ({filterCounts.APPLIED})
        </button>

        <button
          onClick={() => setStatusFilter('WAITING_PRODUCT')}
          className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer text-xs whitespace-nowrap ${
            statusFilter === 'WAITING_PRODUCT'
              ? 'bg-foreground text-background font-bold shadow-2xs'
              : 'bg-muted/60 text-muted-foreground hover:text-foreground'
          }`}
        >
          Product received ({filterCounts.WAITING_PRODUCT})
        </button>

        <button
          onClick={() => setStatusFilter('SUBMITTED')}
          className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer text-xs whitespace-nowrap ${
            statusFilter === 'SUBMITTED'
              ? 'bg-foreground text-background font-bold shadow-2xs'
              : 'bg-muted/60 text-muted-foreground hover:text-foreground'
          }`}
        >
          Content submitted ({filterCounts.SUBMITTED})
        </button>

        <button
          onClick={() => setStatusFilter('PAYMENT_PENDING')}
          className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer text-xs whitespace-nowrap ${
            statusFilter === 'PAYMENT_PENDING'
              ? 'bg-foreground text-background font-bold shadow-2xs'
              : 'bg-muted/60 text-muted-foreground hover:text-foreground'
          }`}
        >
          Waiting payment ({filterCounts.PAYMENT_PENDING})
        </button>

        <button
          onClick={() => setStatusFilter('PAID')}
          className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer text-xs whitespace-nowrap ${
            statusFilter === 'PAID'
              ? 'bg-foreground text-background font-bold shadow-2xs'
              : 'bg-muted/60 text-muted-foreground hover:text-foreground'
          }`}
        >
          Paid ({filterCounts.PAID})
        </button>

        {filterCounts.DECLINED > 0 && (
          <button
            onClick={() => setStatusFilter('DECLINED')}
            className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer text-xs whitespace-nowrap ${
              statusFilter === 'DECLINED'
                ? 'bg-foreground text-background font-bold shadow-2xs'
                : 'bg-muted/60 text-muted-foreground hover:text-foreground'
            }`}
          >
            Declined ({filterCounts.DECLINED})
          </button>
        )}
      </div>

      {/* Campaign Cards Grid */}
      {filteredCampaigns.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 sm:p-12 text-center bg-card/40">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground mb-2.5">
            <Inbox className="h-5 w-5" />
          </div>
          <h4 className="text-xs font-bold text-foreground">
            {searchQuery ? 'No matching campaigns' : 'No campaigns yet'}
          </h4>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-0.5 mb-4">
            {searchQuery
              ? 'Try searching for a different brand name or status.'
              : 'Connect your inbox or add a brand partnership to start tracking your deals.'}
          </p>
          {!searchQuery && !isSelectionMode && <AddCampaignManualModal />}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              userName={userName}
              userEmail={userEmail}
              isSelectionMode={isSelectionMode}
              isSelected={selectedIds.has(campaign.id)}
              onToggleSelect={() => handleToggleSelect(campaign.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
