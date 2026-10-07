'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { UserAvatar } from '@/components/user-avatar'
import { CreatorLinksManager, AffiliateLinkItem } from './creator-links-manager'
import { CreatorPublicProfileManager } from './creator-public-profile-manager'
import { DeleteAccountSection } from './delete-account-section'
import { CampaignsManager } from '@/features/campaigns/components/campaigns-manager'
import { EmailSyncOnboardingCard } from '@/features/campaigns/components/email-sync-onboarding-card'
import { CreatorCampaign } from '@/features/campaigns/types'
import { SignOutButton } from '@/features/auth/components/sign-out-button'
import Link from 'next/link'
import {
  Sparkles,
  ArrowRight,
  Layers,
  Link as LinkIcon,
  User,
  Settings,
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
  inboundToken: string | null
}

export function CreatorWorkspace({
  user,
  effectivePlan,
  profile,
  campaigns,
  affiliateLinks,
  inboundToken,
}: CreatorWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'links' | 'profile' | 'settings'>('campaigns')

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
              <Badge
                variant="outline"
                className="bg-[#FC801A]/10 text-[#FC801A] border-[#FC801A]/30 text-[10px] font-semibold py-0"
              >
                {effectivePlan === 'STANDARD' ? 'Standard' : 'Creator'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
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
          <span>Public Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 font-medium transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'settings'
              ? 'border-[#FC801A] text-[#FC801A] font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>Settings & Sync</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {/* Tab 1: Campaigns */}
        {activeTab === 'campaigns' && (
          <CampaignsManager campaigns={campaigns} />
        )}

        {/* Tab 2: My Links & Codes */}
        {activeTab === 'links' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-card border border-border">
              <CreatorLinksManager links={affiliateLinks} />
            </div>
          </div>
        )}

        {/* Tab 3: Public Profile */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-card border border-border">
            <CreatorPublicProfileManager profile={profile} />
          </div>
        )}

        {/* Tab 4: Settings & Sync */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-2xl mx-auto">
            {/* Minimal Email Sync Card */}
            <EmailSyncOnboardingCard inboundToken={inboundToken} />

            {/* Plan Card */}
            <div className="p-5 rounded-2xl bg-card border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Current Plan
                </span>
                <span className="text-sm font-bold text-foreground">
                  {effectivePlan === 'STANDARD' ? 'Creator Standard' : 'Free Plan'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/plans"
                  className="inline-flex items-center gap-1.5 bg-[#FC801A] hover:bg-[#E66F0D] text-white font-medium text-xs shadow-xs px-3.5 h-8 rounded-xl transition-colors cursor-pointer"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Switch Plan</span>
                  <ArrowRight className="h-3 w-3 ml-0.5" />
                </Link>
                <SignOutButton variant="account" />
              </div>
            </div>

            {/* Danger Zone */}
            <div className="p-5 rounded-2xl bg-card border border-border">
              <DeleteAccountSection />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
