'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { UserAvatar } from '@/components/user-avatar'
import { SignOutButton } from '@/features/auth/components/sign-out-button'
import { AdminCampaignReview, PendingCampaignItem } from './admin-campaign-review'
import { AdminCategoryManager, CategoryItem } from './admin-category-manager'
import { Clock, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminWorkspaceProps {
  user: {
    email: string
    fullName: string
    avatarUrl: string | null
  }
  categories: CategoryItem[]
  pendingCampaigns: PendingCampaignItem[]
}

export function AdminWorkspace({
  user,
  categories,
  pendingCampaigns,
}: AdminWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'moderation' | 'categories'>('moderation')

  return (
    <div className="w-full space-y-6">
      {/* Admin Header: Avatar, Badge, User details, Single Sign Out */}
      <div className="flex items-center justify-between gap-4 pb-5 border-b border-border">
        <div className="flex items-center gap-3">
          <UserAvatar user={user} size="md" />
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-foreground text-background font-bold text-xs px-2.5 py-0.5 shadow-xs">
                Admin
              </Badge>
              {user.fullName && (
                <span className="text-sm font-semibold text-foreground">{user.fullName}</span>
              )}
            </div>
            {user.email && (
              <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
            )}
          </div>
        </div>

        <SignOutButton variant="account" />
      </div>

      {/* 2 Focused Tabs */}
      <div className="flex items-center gap-2 border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab('moderation')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 -mb-[1px]',
            activeTab === 'moderation'
              ? 'border-[#FC801A] text-[#FC801A] bg-[#FC801A]/5'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
          )}
        >
          <Clock className="h-3.5 w-3.5" />
          <span>Pending Collabs</span>
          <span
            className={cn(
              'px-1.5 py-0.2 rounded-full text-[10px] font-bold',
              pendingCampaigns.length > 0
                ? 'bg-[#FC801A] text-white'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {pendingCampaigns.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 -mb-[1px]',
            activeTab === 'categories'
              ? 'border-foreground text-foreground bg-muted/60'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
          )}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Categories</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="pt-2">
        {activeTab === 'moderation' ? (
          <AdminCampaignReview campaigns={pendingCampaigns} />
        ) : (
          <AdminCategoryManager categories={categories} />
        )}
      </div>
    </div>
  )
}
