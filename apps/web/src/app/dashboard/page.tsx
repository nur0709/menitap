import { redirect } from 'next/navigation'
import { getEffectiveUserContext } from '@/features/auth/actions'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SiteHeader } from '@/components/site-header'
import { BrandBorder } from '@/components/brand-border'
import { UserAvatar } from '@/components/user-avatar'
import Link from 'next/link'
import { DeleteAccountSection } from '@/features/account/delete-account-section'
import { BrandCampaignsManager } from '@/features/account/brand-campaigns-manager'
import { AdminWorkspace } from '@/features/account/admin-workspace'
import { CreatorWorkspace } from '@/features/account/creator-workspace'
import {
  getUserLinks,
  getUserBrandLinks,
  getAllCategories,
  getPendingBrandLinks,
} from '@/features/links/actions'
import { getUserCampaigns } from '@/features/campaigns/actions'
import { getGoogleIntegration } from '@/features/integrations/google/actions'
import { SignOutButton } from '@/features/auth/components/sign-out-button'
import { Building2, ArrowRight, Sparkles, ShoppingBag } from 'lucide-react'

export const metadata = {
  title: 'My Account & Campaigns | Menitap',
  description: 'Manage brand campaigns, affiliate links, and creator profile',
}

export default async function DashboardPage() {
  const context = await getEffectiveUserContext()
  const { user, role, effectivePlan, isAdmin } = context

  if (!user) {
    redirect('/sign-in')
  }

  const supabase = await createClient()

  // 1. Admin Workspace View
  if (isAdmin) {
    const [{ data: profile }, allCategories, pendingCampaigns] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      getAllCategories(),
      getPendingBrandLinks(),
    ])

    const email = user.email || ''
    const fullName = profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || ''
    const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture || null

    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors selection:bg-[#FC801A]/30">
        <SiteHeader currentPath="/dashboard" />

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-5xl flex-1">
          <AdminWorkspace
            user={{ email, fullName, avatarUrl }}
            categories={allCategories}
            pendingCampaigns={pendingCampaigns}
          />
        </main>

        <BrandBorder position="bottom" height="h-7 sm:h-9" />
      </div>
    )
  }

  // 2. Standard user, creator, or brand account
  const [{ data: profile }, { affiliateLinks }, { brandLinks }, creatorCampaigns, googleIntegration] =
    await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      role === 'CREATOR' ? getUserLinks() : Promise.resolve({ affiliateLinks: [] }),
      role === 'BRAND' ? getUserBrandLinks() : Promise.resolve({ brandLinks: [] }),
      role === 'CREATOR' ? getUserCampaigns() : Promise.resolve([]),
      role === 'CREATOR'
        ? getGoogleIntegration()
        : Promise.resolve({ isConnected: false, emailAddress: null, lastSyncedAt: null }),
    ])

  const email = user.email || ''
  const fullName = profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || ''
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture || null
  const inboundToken = profile?.inbound_email_token || null

  // 3. Creator Workspace View
  if (role === 'CREATOR') {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors selection:bg-[#FC801A]/30">
        <SiteHeader currentPath="/dashboard" />

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 max-w-6xl flex-1">
          <CreatorWorkspace
            user={{ email, fullName, avatarUrl }}
            role={role}
            effectivePlan={effectivePlan || 'FREE'}
            profile={profile || {}}
            campaigns={creatorCampaigns}
            affiliateLinks={affiliateLinks}
            inboundToken={inboundToken}
            googleIntegration={googleIntegration}
          />
        </main>

        <BrandBorder position="bottom" height="h-7 sm:h-9" />
      </div>
    )
  }

  // 4. Brand Workspace View
  if (role === 'BRAND') {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors selection:bg-[#FC801A]/30">
        <SiteHeader currentPath="/dashboard" />

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-3xl flex-1">
          <Card className="bg-card border-border shadow-xs text-center py-8 px-6 sm:px-8">
            <CardHeader className="flex flex-col items-center gap-4 pb-4">
              <UserAvatar user={{ email, fullName, avatarUrl }} size="lg" />
              <div className="space-y-2">
                <div className="flex justify-center">
                  <Badge
                    variant="outline"
                    className="text-xs px-3 py-1 font-semibold flex items-center gap-1.5 bg-[#08739C] text-white border-0"
                  >
                    <Building2 className="h-3.5 w-3.5" />
                    <span>Brand Account</span>
                  </Badge>
                </div>
                {fullName && <p className="text-base font-medium text-foreground">{fullName}</p>}
                {email && <p className="text-xs text-muted-foreground">{email}</p>}
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-2">
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                Post review campaigns and collaborate with UGC creators.
              </p>

              <BrandCampaignsManager campaigns={brandLinks} />

              <div className="w-full pt-4 border-t border-border mt-4 flex items-center justify-center gap-3">
                <Link
                  href="/plans"
                  className="inline-flex items-center gap-1.5 bg-[#FC801A] hover:bg-[#E66F0D] text-white font-medium text-xs shadow-xs px-4 h-9 rounded-lg transition-colors cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Switch Plan</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
                </Link>
                <SignOutButton variant="account" />
              </div>

              <DeleteAccountSection />
            </CardContent>
          </Card>
        </main>

        <BrandBorder position="bottom" height="h-7 sm:h-9" />
      </div>
    )
  }

  // 5. Explorer / General user View
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors selection:bg-[#FC801A]/30">
      <SiteHeader currentPath="/dashboard" />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-14 max-w-2xl flex-1 flex flex-col justify-center">
        <Card className="bg-card border-border shadow-xs text-center py-8 px-6 sm:px-8">
          <CardHeader className="flex flex-col items-center gap-4 pb-4">
            <UserAvatar user={{ email, fullName, avatarUrl }} size="lg" />
            <div className="space-y-2">
              <div className="flex justify-center">
                <Badge
                  variant="outline"
                  className="text-xs px-3 py-1 font-semibold flex items-center gap-1.5 bg-[#08739C]/10 text-[#08739C] dark:text-[#38BDF8] border-[#08739C]/30"
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  <span>Explorer</span>
                </Badge>
              </div>
              {fullName && <p className="text-base font-medium text-foreground">{fullName}</p>}
              {email && <p className="text-xs text-muted-foreground">{email}</p>}
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-2">
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              Find verified deals and watch honest creator reviews.
            </p>

            <div className="w-full pt-4 border-t border-border mt-4 flex items-center justify-center gap-3">
              <Link
                href="/plans"
                className="inline-flex items-center gap-1.5 bg-[#FC801A] hover:bg-[#E66F0D] text-white font-medium text-xs shadow-xs px-4 h-9 rounded-lg transition-colors cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Upgrade to Creator</span>
                <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
              </Link>
              <SignOutButton variant="account" />
            </div>

            <DeleteAccountSection />
          </CardContent>
        </Card>
      </main>

      <BrandBorder position="bottom" height="h-7 sm:h-9" />
    </div>
  )
}
