import { redirect } from 'next/navigation'
import { getEffectiveUserContext, signOut } from '@/features/auth/actions'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BrandBorder } from '@/components/brand-border'
import { BrandLogo } from '@/components/brand-logo'
import { MainNav } from '@/components/main-nav'
import { MobileNav } from '@/components/mobile-nav'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserAvatar } from '@/components/user-avatar'
import Link from 'next/link'
import { DeleteAccountSection } from '@/features/account/delete-account-section'
import { CreatorLinksManager } from '@/features/account/creator-links-manager'
import { BrandCampaignsManager } from '@/features/account/brand-campaigns-manager'
import { CreatorPublicProfileManager } from '@/features/account/creator-public-profile-manager'
import { AdminCategoryManager } from '@/features/account/admin-category-manager'
import { getUserLinks, getUserBrandLinks, getAllCategories } from '@/features/links/actions'
import { LogOut, ShoppingBag, Video, Building2, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react'


export const metadata = {
  title: 'My Account | Menitap',
  description: 'My Account overview',
}

export default async function DashboardPage() {
  const context = await getEffectiveUserContext()
  const { user, role, effectivePlan, isAdmin } = context

  if (!user) {
    redirect('/sign-in')
  }

  const supabase = await createClient()
  const [{ data: profile }, { affiliateLinks }, { brandLinks }, allCategories] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single(),
    role === 'CREATOR' ? getUserLinks() : Promise.resolve({ affiliateLinks: [] }),
    role === 'BRAND' ? getUserBrandLinks() : Promise.resolve({ brandLinks: [] }),
    isAdmin ? getAllCategories() : Promise.resolve([]),
  ])

  const email = user.email || ''
  const fullName = profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || ''
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture || null
  const currentPlan = effectivePlan || 'FREE'

  // Determine dynamic account type configuration based on role & subscription plan
  let accountTag = {
    name: 'Explorer',
    description: 'Find verified deals and watch honest creator reviews.',
    badgeBg: 'bg-[#08739C]/10 text-[#08739C] dark:text-[#38BDF8] border-[#08739C]/30',
    icon: ShoppingBag,
  }

  if (role === 'CREATOR') {
    if (currentPlan === 'STANDARD') {
      accountTag = {
        name: 'Creator Standard',
        description: 'Public portfolio, category-filtered brand discovery, and product reviews.',
        badgeBg: 'bg-[#FC801A] text-white border-0 shadow-sm',
        icon: Video,
      }
    } else {
      accountTag = {
        name: 'Creator Basic',
        description: 'Access brand application links, receive products to test, and share deals.',
        badgeBg: 'bg-[#FC801A]/10 text-[#FC801A] border-[#FC801A]/30',
        icon: Video,
      }
    }
  } else if (role === 'BRAND') {
    accountTag = {
      name: 'Brand',
      description: 'Post review campaigns and collaborate with UGC creators.',
      badgeBg: 'bg-[#08739C] text-white border-0',
      icon: Building2,
    }
  } else if (role === 'ADMIN') {
    accountTag = {
      name: 'Admin',
      description: 'System administrator.',
      badgeBg: 'bg-destructive/10 text-destructive border-destructive/30',
      icon: ShieldCheck,
    }
  }

  const RoleIcon = accountTag.icon

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors selection:bg-[#FC801A]/30">
      <BrandBorder position="top" height="h-7 sm:h-9" />

      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <MobileNav currentPath="/dashboard" role={role} />
            <BrandLogo size="md" />
          </div>
          <MainNav currentPath="/dashboard" role={role} />

          <div className="flex items-center gap-2 sm:gap-3">
            <UserAvatar user={{ email, fullName, avatarUrl }} size="sm" />
            <form action={signOut}>
              <Button variant="ghost" size="sm" type="submit" className="text-muted-foreground hover:text-foreground">
                <LogOut className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </form>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main My Account page */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-14 max-w-2xl flex-1 flex flex-col justify-center">
        <Card className="bg-card border-border shadow-sm text-center py-8 px-6 sm:px-8">
          <CardHeader className="flex flex-col items-center gap-4 pb-4">
            <UserAvatar user={{ email, fullName, avatarUrl }} size="lg" />
            <div className="space-y-2">
              <div className="flex justify-center">
                <Badge
                  variant="outline"
                  className={`text-xs px-3 py-1 font-semibold flex items-center gap-1.5 ${accountTag.badgeBg}`}
                >
                  <RoleIcon className="h-3.5 w-3.5" />
                  <span>{accountTag.name}</span>
                </Badge>
              </div>
              {fullName && <p className="text-base font-medium text-foreground">{fullName}</p>}
              {email && <p className="text-xs text-muted-foreground">{email}</p>}
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-2">
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              {accountTag.description}
            </p>

            {/* Creator Standard: Public Creator Profile & Portfolio Manager (Creator Standard only) */}
            {role === 'CREATOR' && currentPlan === 'STANDARD' && (
              <CreatorPublicProfileManager profile={profile || {}} />
            )}

            {/* Creator Links Manager: manage shared affiliate deals (Creator only) */}
            {role === 'CREATOR' && (
              <CreatorLinksManager links={affiliateLinks} />
            )}

            {/* Brand Campaigns Manager: manage posted brand collab links (Brand only) */}
            {role === 'BRAND' && (
              <BrandCampaignsManager campaigns={brandLinks} />
            )}

            {/* Switch Plan button: forwards to /plans to compare, upgrade, or switch tiers */}
            <div className="w-full pt-4 border-t border-border mt-4 flex justify-center">
              <Link
                href="/plans"
                className="inline-flex items-center gap-1.5 bg-[#FC801A] hover:bg-[#E66F0D] text-white font-medium text-xs shadow-xs px-5 h-9 rounded-lg transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Switch Plan</span>
                <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
              </Link>
            </div>




            {/* Danger Zone: Delete Account (Regular accounts only) */}
            {!isAdmin && <DeleteAccountSection />}

            {/* Admin Category Manager: add/remove categories across tabs */}
            {isAdmin && <AdminCategoryManager categories={allCategories} />}
          </CardContent>
        </Card>
      </main>

      <BrandBorder position="bottom" height="h-7 sm:h-9" />
    </div>
  )
}
