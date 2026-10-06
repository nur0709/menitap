'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { UserAvatar } from '@/components/user-avatar'
import { SignOutButton } from '@/features/auth/components/sign-out-button'
import { AdminCampaignReview, PendingCampaignItem } from './admin-campaign-review'
import { AdminCategoryManager, CategoryItem } from './admin-category-manager'
import { AdminLiveCampaigns, ActiveCampaignItem } from './admin-live-campaigns'
import { AdminPlatformStats } from '@/features/links/actions'
import {
  ShieldCheck,
  Clock,
  Layers,
  Sparkles,
  ShoppingBag,
  Users,
  CheckCircle2,
  ExternalLink,
  User,
  ArrowUpRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminWorkspaceProps {
  user: {
    email: string
    fullName: string
    avatarUrl: string | null
  }
  categories: CategoryItem[]
  pendingCampaigns: PendingCampaignItem[]
  activeCampaigns: ActiveCampaignItem[]
  stats: AdminPlatformStats | null
}

export function AdminWorkspace({
  user,
  categories,
  pendingCampaigns,
  activeCampaigns,
  stats,
}: AdminWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'moderation' | 'categories' | 'live' | 'account'>('moderation')

  const pendingCount = stats?.pendingCollabsCount ?? pendingCampaigns.length
  const activeCollabsCount = stats?.activeCollabsCount ?? activeCampaigns.length
  const activeDealsCount = stats?.activeDealsCount ?? 0
  const activeCreatorsCount = stats?.activeCreatorsCount ?? 0

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-200">
      {/* Admin Command Center Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <Badge className="bg-foreground text-background font-bold text-xs px-2.5 py-0.5 shadow-xs flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-[#FC801A]" />
              <span>Admin Workspace</span>
            </Badge>
            <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
              {user.email}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Platform Command Center
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
            Manage incoming campaign submissions, configure discovery category taxonomies, and monitor platform health without manual code changes.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <SignOutButton variant="account" />
        </div>
      </div>

      {/* Glanceable Platform KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Pending Collabs */}
        <button
          type="button"
          onClick={() => setActiveTab('moderation')}
          className={cn(
            'p-4 rounded-2xl border text-left transition-all cursor-pointer group',
            pendingCount > 0
              ? 'border-[#FC801A]/40 bg-[#FC801A]/5 hover:bg-[#FC801A]/10 hover:border-[#FC801A]'
              : 'border-border bg-card hover:border-foreground/20'
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground">Pending Review</span>
            <Clock className={cn('h-4 w-4', pendingCount > 0 ? 'text-[#FC801A]' : 'text-muted-foreground')} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-foreground">{pendingCount}</span>
            {pendingCount > 0 ? (
              <Badge className="bg-[#FC801A] text-white text-[10px] py-0 px-1.5">
                Needs Review
              </Badge>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                Clean
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 group-hover:text-foreground transition-colors">
            Click to open review queue &rarr;
          </p>
        </button>

        {/* Metric 2: Live Brand Collabs */}
        <button
          type="button"
          onClick={() => setActiveTab('live')}
          className="p-4 rounded-2xl border border-border bg-card hover:border-foreground/20 text-left transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground">Active Collabs</span>
            <Sparkles className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-foreground">{activeCollabsCount}</span>
            <span className="text-[11px] text-muted-foreground">campaigns</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 group-hover:text-foreground transition-colors">
            Live on /collabs &rarr;
          </p>
        </button>

        {/* Metric 3: Live Deals */}
        <Link
          href="/deals"
          className="p-4 rounded-2xl border border-border bg-card hover:border-foreground/20 text-left transition-all cursor-pointer group block"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground">Active Deals</span>
            <ShoppingBag className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-foreground">{activeDealsCount}</span>
            <span className="text-[11px] text-muted-foreground">deals</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 group-hover:text-foreground transition-colors">
            View Deals directory &rarr;
          </p>
        </Link>

        {/* Metric 4: Creator Portfolios */}
        <Link
          href="/creators"
          className="p-4 rounded-2xl border border-border bg-card hover:border-foreground/20 text-left transition-all cursor-pointer group block"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground">Creators</span>
            <Users className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-foreground">{activeCreatorsCount}</span>
            <span className="text-[11px] text-muted-foreground">verified</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 group-hover:text-foreground transition-colors">
            View Creators directory &rarr;
          </p>
        </Link>
      </div>

      {/* Segmented Tab Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('moderation')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer whitespace-nowrap border-b-2 -mb-[1px]',
            activeTab === 'moderation'
              ? 'border-[#FC801A] text-[#FC801A] bg-[#FC801A]/5'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
          )}
        >
          <Clock className="h-3.5 w-3.5" />
          <span>Moderation Queue</span>
          {pendingCount > 0 ? (
            <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#FC801A] text-white">
              {pendingCount}
            </span>
          ) : (
            <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-medium bg-muted text-muted-foreground">
              0
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer whitespace-nowrap border-b-2 -mb-[1px]',
            activeTab === 'categories'
              ? 'border-foreground text-foreground bg-muted/60'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
          )}
        >
          <Layers className="h-3.5 w-3.5 text-[#08739C] dark:text-[#38BDF8]" />
          <span>Category Taxonomies</span>
          <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-medium bg-muted text-muted-foreground">
            {categories.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('live')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer whitespace-nowrap border-b-2 -mb-[1px]',
            activeTab === 'live'
              ? 'border-foreground text-foreground bg-muted/60'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
          )}
        >
          <Sparkles className="h-3.5 w-3.5 text-[#FC801A]" />
          <span>Live Collabs</span>
          <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-medium bg-muted text-muted-foreground">
            {activeCampaigns.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('account')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer whitespace-nowrap border-b-2 -mb-[1px]',
            activeTab === 'account'
              ? 'border-foreground text-foreground bg-muted/60'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
          )}
        >
          <User className="h-3.5 w-3.5" />
          <span>Admin Account</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="pt-2">
        {/* Tab 1: Moderation Queue */}
        {activeTab === 'moderation' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <AdminCampaignReview campaigns={pendingCampaigns} />
          </div>
        )}

        {/* Tab 2: Category Manager */}
        {activeTab === 'categories' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <AdminCategoryManager categories={categories} />
          </div>
        )}

        {/* Tab 3: Live Campaigns Oversight */}
        {activeTab === 'live' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <AdminLiveCampaigns campaigns={activeCampaigns} />
          </div>
        )}

        {/* Tab 4: Admin Account Details & Quick Links */}
        {activeTab === 'account' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-150">
            <Card className="bg-card border-border shadow-xs">
              <CardContent className="p-6 text-center space-y-4">
                <div className="flex justify-center">
                  <UserAvatar user={user} size="lg" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-center">
                    <Badge className="bg-foreground text-background font-bold text-xs px-2.5 py-0.5">
                      System Administrator
                    </Badge>
                  </div>
                  {user.fullName && (
                    <p className="text-base font-semibold text-foreground pt-1">{user.fullName}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  You have full administrative authority across all sections of Menitap.
                </p>

                <div className="pt-4 border-t border-border flex justify-center">
                  <SignOutButton variant="account" />
                </div>
              </CardContent>
            </Card>

            {/* Quick Administrative Shortcuts */}
            <div className="p-5 rounded-2xl border border-border bg-card/60 space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Quick Platform Shortcuts
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <Link
                  href="/deals"
                  className="p-2.5 rounded-xl border border-border bg-background hover:bg-muted flex items-center justify-between text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span>Deals Directory</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/collabs"
                  className="p-2.5 rounded-xl border border-border bg-background hover:bg-muted flex items-center justify-between text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span>Brand Collabs Board</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/creators"
                  className="p-2.5 rounded-xl border border-border bg-background hover:bg-muted flex items-center justify-between text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span>Creators Directory</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/post-collab"
                  className="p-2.5 rounded-xl border border-border bg-background hover:bg-muted flex items-center justify-between text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span>Public Post Collab Form</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-[#FC801A]" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
