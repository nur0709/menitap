'use client'

import { useState } from 'react'
import { UserAvatar } from '@/components/user-avatar'
import { CreatorLinksManager, AffiliateLinkItem } from './creator-links-manager'
import { CreatorPublicProfileManager } from './creator-public-profile-manager'
import { CampaignsManager } from '@/features/campaigns/components/campaigns-manager'
import { GoogleIntegrationStatus } from '@/features/integrations/google/actions'
import { CreatorCampaign } from '@/features/campaigns/types'
import { Category } from '@/features/links/components/add-deal-modal'
import { SignOutButton } from '@/features/auth/components/sign-out-button'
import {
  Layers,
  Link as LinkIcon,
  User,
} from 'lucide-react'

interface CreatorWorkspaceProps {
  user: {
    email: string
    fullName: string
    avatarUrl: string | null
  }
  role?: string
  effectivePlan: string
  profile: {
    is_public_profile?: boolean | null
    instagram_url?: string | null
    tiktok_url?: string | null
    youtube_url?: string | null
    bio?: string | null
  }
  campaigns: CreatorCampaign[]
  affiliateLinks: AffiliateLinkItem[]
  categories?: Category[]
  googleIntegration?: GoogleIntegrationStatus
}

export function CreatorWorkspace({
  user,
  effectivePlan,
  profile,
  campaigns,
  affiliateLinks,
  categories,
  googleIntegration,
}: CreatorWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'links' | 'profile'>('campaigns')

  return (
    <div className="space-y-6">
      {/* Quiet Header */}
      <div className="flex items-center justify-between gap-4 pb-1">
        <div className="flex items-center gap-3">
          <UserAvatar user={user} size="md" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-foreground">
                {user.fullName || 'Creator Workspace'}
              </h1>
              {effectivePlan === 'STANDARD' ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FC801A] text-white shadow-2xs">
                  Standard
                </span>
              ) : effectivePlan === 'BASIC' ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border border-[#FC801A]/50 text-[#FC801A] bg-[#FC801A]/5">
                  Basic
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border border-[#08739C]/40 text-[#08739C] dark:text-[#38BDF8] bg-[#08739C]/5">
                  Free
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <SignOutButton variant="account" />
        </div>
      </div>

      {/* Clean Underline Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-border overflow-x-auto scrollbar-none text-xs sm:text-sm">
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 font-medium transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'campaigns'
              ? 'border-[#FC801A] text-[#FC801A] font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Campaigns</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted text-muted-foreground font-bold">
            {campaigns.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('links')}
          className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 font-medium transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'links'
              ? 'border-[#FC801A] text-[#FC801A] font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <LinkIcon className="h-4 w-4" />
          <span>My Links & Codes</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted text-muted-foreground font-bold">
            {affiliateLinks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 font-medium transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-[#FC801A] text-[#FC801A] font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <User className="h-4 w-4" />
          <span>Profile & Settings</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {/* Tab 1: Campaigns */}
        {activeTab === 'campaigns' && (
          <div className="space-y-4">
            <CampaignsManager
              campaigns={campaigns}
              userName={user.fullName}
              googleIntegration={
                googleIntegration || {
                  isConnected: false,
                  emailAddress: null,
                  lastSyncedAt: null,
                }
              }
            />
          </div>
        )}

        {/* Tab 2: My Links & Codes */}
        {activeTab === 'links' && (
          <div className="space-y-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border">
              <CreatorLinksManager links={affiliateLinks} categories={categories} />
            </div>
          </div>
        )}

        {/* Tab 3: Profile & Settings */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto">
            <CreatorPublicProfileManager profile={profile} effectivePlan={effectivePlan} />
          </div>
        )}
      </div>
    </div>
  )
}
