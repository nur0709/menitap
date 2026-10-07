'use client'

import { useState, useMemo } from 'react'
import { CreatorCampaign, CampaignStatus } from '../types'
import { CampaignCard } from './campaign-card'
import { AddCampaignManualModal } from './add-campaign-manual-modal'
import { Search, Inbox } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface CampaignsManagerProps {
  campaigns: CreatorCampaign[]
}

export function CampaignsManager({ campaigns }: CampaignsManagerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | CampaignStatus>('ALL')

  // Calculate Quick Stats
  const stats = useMemo(() => {
    let pendingCount = 0
    let paidCount = 0

    campaigns.forEach((c) => {
      if (c.status === 'PAID') {
        paidCount++
      } else if (c.status !== 'DECLINED') {
        pendingCount++
      }
    })

    return {
      total: campaigns.length,
      active: pendingCount,
      paid: paidCount,
    }
  }, [campaigns])

  // Filtered campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      // Status filter
      if (statusFilter !== 'ALL' && c.status !== statusFilter) {
        return false
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
    return {
      ALL: campaigns.length,
      NEW_PITCH: campaigns.filter((c) => c.status === 'NEW_PITCH').length,
      ACCEPTED: campaigns.filter((c) => c.status === 'ACCEPTED').length,
      FILMING: campaigns.filter((c) => c.status === 'FILMING').length,
      DELIVERED: campaigns.filter((c) => c.status === 'DELIVERED').length,
      PAID: campaigns.filter((c) => c.status === 'PAID').length,
    }
  }, [campaigns])

  return (
    <div className="space-y-6">
      {/* Top Banner: Stats & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-muted/50 via-card to-muted/20 border border-border shadow-xs">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Active Deals
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-foreground">
              {stats.active}
            </span>
          </div>
          <div className="h-8 w-px bg-border" />
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Completed & Paid
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {stats.paid}
            </span>
          </div>
          <div className="h-8 w-px bg-border" />
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Total Ingested
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-foreground">
              {stats.total}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AddCampaignManualModal />
        </div>
      </div>

      {/* Search & Filter Pills */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="h-3.5 w-3.5 absolute left-3 top-3 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search brands or deliverables..."
              className="pl-8 bg-background border-border text-xs h-9 rounded-xl"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer text-xs whitespace-nowrap ${
                statusFilter === 'ALL'
                  ? 'bg-foreground text-background font-bold'
                  : 'bg-muted/60 text-muted-foreground hover:text-foreground'
              }`}
            >
              All ({filterCounts.ALL})
            </button>
            <button
              onClick={() => setStatusFilter('NEW_PITCH')}
              className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer text-xs whitespace-nowrap ${
                statusFilter === 'NEW_PITCH'
                  ? 'bg-purple-600 text-white font-bold'
                  : 'bg-muted/60 text-muted-foreground hover:text-foreground'
              }`}
            >
              Pitches ({filterCounts.NEW_PITCH})
            </button>
            <button
              onClick={() => setStatusFilter('FILMING')}
              className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer text-xs whitespace-nowrap ${
                statusFilter === 'FILMING'
                  ? 'bg-[#FC801A] text-white font-bold'
                  : 'bg-muted/60 text-muted-foreground hover:text-foreground'
              }`}
            >
              Filming ({filterCounts.FILMING})
            </button>
            <button
              onClick={() => setStatusFilter('DELIVERED')}
              className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer text-xs whitespace-nowrap ${
                statusFilter === 'DELIVERED'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-muted/60 text-muted-foreground hover:text-foreground'
              }`}
            >
              Delivered ({filterCounts.DELIVERED})
            </button>
            <button
              onClick={() => setStatusFilter('PAID')}
              className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer text-xs whitespace-nowrap ${
                statusFilter === 'PAID'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-muted/60 text-muted-foreground hover:text-foreground'
              }`}
            >
              Paid ({filterCounts.PAID})
            </button>
          </div>
        </div>
      </div>

      {/* Campaign Cards Grid */}
      {filteredCampaigns.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 sm:p-14 text-center bg-card/50">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
            <Inbox className="h-6 w-6" />
          </div>
          <h4 className="text-sm font-bold text-foreground">No campaign deals found</h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-5">
            {searchQuery
              ? 'Try adjusting your search terms or filters.'
              : 'Add your first campaign deal or set up 24/7 email forwarding to watch deals generate automatically!'}
          </p>
          <AddCampaignManualModal />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCampaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}
    </div>
  )
}
