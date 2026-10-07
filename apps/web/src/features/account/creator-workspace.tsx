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
  Video,
  Layers,
  Link as LinkIcon,
  User,
  Settings,
  Mail,
} from 'lucide-react'

interface CreatorWorkspaceProps {
  user: {
    email: string
    fullName: string
    avatarUrl: string | null
  }
  role: string
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
    <div className="space-y-6 sm:space-y-8">
      {/* Header Banner: Welcome & Quick Identity */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3 sm:gap-4">
          <UserAvatar user={user} size="lg" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                {user.fullName ? `Hello, ${user.fullName.split(' ')[0]} 👋` : 'Creator Workspace'}
              </h1>
              <Badge
                variant="outline"
                className="bg-[#FC801A]/10 text-[#FC801A] border-[#FC801A]/30 text-[11px] font-semibold flex items-center gap-1"
              >
                <Video className="h-3 w-3" />
                <span>{effectivePlan === 'STANDARD' ? 'Creator Standard' : 'Creator'}</span>
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>

        {/* Quick Inbound Email Badge in Header */}
        {inboundToken && (
          <div className="flex items-center gap-2 p-2 px-3 rounded-xl bg-muted/60 border border-border text-xs text-muted-foreground">
            <Mail className="h-3.5 w-3.5 text-[#08739C] dark:text-[#38BDF8]" />
            <span className="text-[11px] font-medium font-mono">deals+{inboundToken}@in.menitap.com</span>
            <button
              onClick={() => setActiveTab('settings')}
              className="text-[11px] font-semibold text-[#FC801A] hover:underline cursor-pointer ml-1"
            >
              Sync ↗
            </button>
          </div>
        )}
      </div>

      {/* Modern Segmented Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-muted/50 border border-border overflow-x-auto scrollbar-none">
        {/* Tab 1: Campaigns */}
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'campaigns'
              ? 'bg-card text-foreground shadow-xs border border-border font-bold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Layers className="h-4 w-4 text-[#FC801A]" />
          <span>Campaigns</span>
          <span className="ml-0.5 text-[10px] px-1.5 py-0.2 rounded-full bg-[#FC801A]/10 text-[#FC801A] font-bold">
            {campaigns.length}
          </span>
        </button>

        {/* Tab 2: My Links & Codes */}
        <button
          onClick={() => setActiveTab('links')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'links'
              ? 'bg-card text-foreground shadow-xs border border-border font-bold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <LinkIcon className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8]" />
          <span>My Links & Codes</span>
          <span className="ml-0.5 text-[10px] px-1.5 py-0.2 rounded-full bg-muted text-muted-foreground font-bold">
            {affiliateLinks.length}
          </span>
        </button>

        {/* Tab 3: Public Profile */}
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-card text-foreground shadow-xs border border-border font-bold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <User className="h-4 w-4" />
          <span>Public Profile</span>
        </button>

        {/* Tab 4: Settings & Sync */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-card text-foreground shadow-xs border border-border font-bold'
              : 'text-muted-foreground hover:text-foreground'
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
          <div className="space-y-6 max-w-3xl mx-auto">
            {/* Email Sync Onboarding */}
            <EmailSyncOnboardingCard inboundToken={inboundToken} />

            {/* Plan Card */}
            <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Current Plan
                </span>
                <span className="text-base font-bold text-foreground">
                  {effectivePlan === 'STANDARD' ? 'Creator Standard' : 'Free Plan'}
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {effectivePlan === 'STANDARD'
                    ? 'Full access to verified deals, public portfolio, and deal tracking.'
                    : 'Upgrade to Standard for verified deals and unlimited public portfolio features.'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/plans"
                  className="inline-flex items-center gap-1.5 bg-[#FC801A] hover:bg-[#E66F0D] text-white font-medium text-xs shadow-xs px-4 h-9 rounded-xl transition-colors cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Switch Plan</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
                </Link>
                <SignOutButton variant="account" />
              </div>
            </div>

            {/* Danger Zone */}
            <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border">
              <DeleteAccountSection />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
