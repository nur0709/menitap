import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser, signOut } from '@/features/auth/actions'
import { getUserLinks } from '@/features/links/actions'
import { createClient } from '@/lib/supabase/server'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BrandBorder } from '@/components/brand-border'
import { BrandLogo } from '@/components/brand-logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { RoleSwitcher } from '@/features/account/role-switcher'
import {
  ShoppingBag,
  Bookmark,
  PlayCircle,
  Sparkles,
  ArrowRight,
  LogOut,
  Tag,
  CheckCircle2,
  BookOpen,
  PlusCircle,
  Video,
  Building2,
  Users,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'

export const metadata = {
  title: 'My Account | Menitap',
  description: 'Manage your saved deals, creator collaborations, and campaigns.',
}

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  const supabase = await createClient()

  // Query database profile to ensure accurate role even if metadata hasn't synced
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const email = user.email || 'Member'
  const fullName = profile?.full_name || user.user_metadata?.full_name || email.split('@')[0]
  const role = (profile?.role || user.user_metadata?.role || 'USER').toUpperCase()

  // Fetch user submissions and active catalog items
  const { affiliateLinks, brandLinks } = await getUserLinks()

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors selection:bg-[#FC801A]/30">
      {/* Decorative Top Border Ribbon */}
      <BrandBorder position="top" height="h-6 sm:h-8" />

      {/* Top Navbar */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <BrandLogo size="md" />
            <nav className="hidden sm:flex gap-4 text-sm text-muted-foreground">
              <Link href="/dashboard" className="text-foreground font-semibold">Dashboard</Link>
              <Link href="/for-shoppers" className="hover:text-foreground transition-colors">For Shoppers</Link>
              <Link href="/for-creators" className="hover:text-foreground transition-colors">For Creators</Link>
              <Link href="/for-brands" className="hover:text-foreground transition-colors">For Brands</Link>
              <Link href="/plans" className="hover:text-foreground transition-colors">Plans</Link>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex flex-col text-right ml-1">
              <span className="text-xs font-semibold text-foreground">{fullName}</span>
              <span className="text-[10px] text-muted-foreground">{email}</span>
            </div>
            {role === 'ADMIN' && (
              <Badge className="bg-[#08739C] text-white border-0 text-xs">Admin</Badge>
            )}
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

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 max-w-6xl flex-1">
        {/* Account Role Switcher Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-border">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Account Hub</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Current mode: <strong className="text-foreground">{role === 'CREATOR' ? 'Creator' : role === 'BRAND' ? 'Brand / Agency' : 'Shopper & Learner'}</strong>
            </p>
          </div>
          <RoleSwitcher currentRole={role} />
        </div>

        {/* ============================================================== */}
        {/* ROLE 1: CREATOR VIEW */}
        {/* ============================================================== */}
        {role === 'CREATOR' && (
          <div>
            {/* Welcome Banner */}
            <div className="rounded-2xl p-6 sm:p-8 bg-card border border-border mb-10 shadow-sm relative overflow-hidden">
              <div className="relative z-10 max-w-2xl">
                <Badge variant="outline" className="border-[#FC801A]/40 text-[#FC801A] bg-[#FC801A]/10 mb-3 font-semibold">
                  <Video className="w-3.5 h-3.5 mr-1.5" /> Creator Account
                </Badge>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                  Welcome back, {fullName}!
                </h1>
                <p className="mt-2 text-muted-foreground text-sm sm:text-base leading-relaxed">
                  Manage your affiliate product links, apply to receive free products for UGC reviews, and expand your creator portfolio.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/dashboard/submit?type=affiliate"
                    className={cn(
                      buttonVariants({ size: 'sm' }),
                      'bg-[#FC801A] hover:bg-[#E66F0D] text-white border-0 shadow-sm font-medium'
                    )}
                  >
                    <PlusCircle className="mr-1.5 h-4 w-4" /> Submit Product / Affiliate Deal
                  </Link>
                  <Link
                    href="/for-creators"
                    className={cn(
                      buttonVariants({ variant: 'outline', size: 'sm' }),
                      'border-border hover:bg-accent text-foreground font-medium'
                    )}
                  >
                    Browse Brand Collabs <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* 3 Core Hub Cards for Creators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {/* Card 1: My Submitted Affiliate Deals */}
              <Card className="bg-card border-border shadow-sm flex flex-col hover:border-[#FC801A]/40 transition-colors">
                <CardHeader className="pb-3">
                  <div className="h-10 w-10 rounded-xl bg-[#FC801A]/10 flex items-center justify-center text-[#FC801A] mb-3">
                    <Tag className="h-5 w-5" />
                  </div>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-foreground">My Affiliate Deals</CardTitle>
                    <Badge variant="outline" className="text-xs">{affiliateLinks.length}</Badge>
                  </div>
                  <CardDescription className="text-xs text-muted-foreground">
                    Links you share with shoppers to earn commission
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  {affiliateLinks.length === 0 ? (
                    <div className="p-4 rounded-xl bg-muted/30 border border-border/60 text-center">
                      <Tag className="h-6 w-6 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">No links submitted yet.</p>
                      <Link
                        href="/dashboard/submit?type=affiliate"
                        className="text-xs font-semibold text-[#FC801A] hover:underline mt-2 inline-block"
                      >
                        + Submit your first deal
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {affiliateLinks.slice(0, 3).map((link) => (
                        <div key={link.id} className="p-2.5 rounded-lg bg-muted/40 border border-border/60 flex items-center justify-between text-xs">
                          <div className="truncate mr-2">
                            <p className="font-semibold text-foreground truncate">{link.title}</p>
                            <span className="text-[10px] text-muted-foreground">{link.click_count} clicks</span>
                          </div>
                          <Badge variant="secondary" className="text-[10px] uppercase font-bold shrink-0">
                            {link.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Card 2: Brand Collab Opportunities */}
              <Card className="bg-card border-border shadow-sm flex flex-col hover:border-[#FC801A]/40 transition-colors">
                <CardHeader className="pb-3">
                  <div className="h-10 w-10 rounded-xl bg-[#08739C]/10 flex items-center justify-center text-[#08739C] dark:text-[#38BDF8] mb-3">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg text-foreground">Products For Review</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Companies looking for UGC creators right now
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-2.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <CheckCircle2 className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8]" />
                    <span>Free products sent to approved creators</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <CheckCircle2 className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8]" />
                    <span>Direct brand manager application forms</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <CheckCircle2 className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8]" />
                    <span>Zero agency cut on your sponsorships</span>
                  </div>
                  <div className="pt-2">
                    <Link
                      href="/for-creators"
                      className="text-xs font-semibold text-[#08739C] dark:text-[#38BDF8] hover:underline inline-flex items-center gap-1"
                    >
                      Browse Collabs Directory <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Card 3: Free UGC Lessons */}
              <Card className="bg-card border-border shadow-sm flex flex-col hover:border-[#FC801A]/40 transition-colors">
                <CardHeader className="pb-3">
                  <div className="h-10 w-10 rounded-xl bg-[#FC801A]/10 flex items-center justify-center text-[#FC801A] mb-3">
                    <PlayCircle className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg text-foreground">UGC Creator Academy</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Level up your hooks, lighting, and brand pitch
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-2.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <BookOpen className="h-4 w-4 text-[#FC801A]" />
                    <span>How to film high-converting product reviews</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <BookOpen className="h-4 w-4 text-[#FC801A]" />
                    <span>Scripting 3-second viral TikTok hooks</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <BookOpen className="h-4 w-4 text-[#FC801A]" />
                    <span>Pitching brands via DM and cold email</span>
                  </div>
                  <div className="pt-2">
                    <Link
                      href="/for-creators"
                      className="text-xs font-semibold text-[#FC801A] hover:underline inline-flex items-center gap-1"
                    >
                      Watch Video Lessons <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ROLE 2: BRAND / AGENCY VIEW */}
        {/* ============================================================== */}
        {role === 'BRAND' && (
          <div>
            {/* Welcome Banner */}
            <div className="rounded-2xl p-6 sm:p-8 bg-card border border-border mb-10 shadow-sm relative overflow-hidden">
              <div className="relative z-10 max-w-2xl">
                <Badge variant="outline" className="border-[#08739C]/40 text-[#08739C] dark:text-[#38BDF8] bg-[#08739C]/10 mb-3 font-semibold">
                  <Building2 className="w-3.5 h-3.5 mr-1.5" /> Brand & Agency Account
                </Badge>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                  Welcome back, {fullName}!
                </h1>
                <p className="mt-2 text-muted-foreground text-sm sm:text-base leading-relaxed">
                  Post product-for-review campaigns, receive direct creator applications, and discover verified UGC creators 100% free with zero commissions.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/dashboard/submit?type=brand"
                    className={cn(
                      buttonVariants({ size: 'sm' }),
                      'bg-[#08739C] hover:bg-[#02547A] text-white border-0 shadow-sm font-medium'
                    )}
                  >
                    <PlusCircle className="mr-1.5 h-4 w-4" /> Post New Review Campaign
                  </Link>
                  <Link
                    href="/for-brands"
                    className={cn(
                      buttonVariants({ variant: 'outline', size: 'sm' }),
                      'border-border hover:bg-accent text-foreground font-medium'
                    )}
                  >
                    Discover UGC Creators <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* 3 Core Hub Cards for Brands */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {/* Card 1: My Review Campaigns */}
              <Card className="bg-card border-border shadow-sm flex flex-col hover:border-[#08739C]/40 transition-colors">
                <CardHeader className="pb-3">
                  <div className="h-10 w-10 rounded-xl bg-[#08739C]/10 flex items-center justify-center text-[#08739C] dark:text-[#38BDF8] mb-3">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-foreground">My Campaigns</CardTitle>
                    <Badge variant="outline" className="text-xs">{brandLinks.length}</Badge>
                  </div>
                  <CardDescription className="text-xs text-muted-foreground">
                    Active creator callouts & review portals
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  {brandLinks.length === 0 ? (
                    <div className="p-4 rounded-xl bg-muted/30 border border-border/60 text-center">
                      <Building2 className="h-6 w-6 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">No active campaigns posted.</p>
                      <Link
                        href="/dashboard/submit?type=brand"
                        className="text-xs font-semibold text-[#08739C] dark:text-[#38BDF8] hover:underline mt-2 inline-block"
                      >
                        + Post a review opportunity
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {brandLinks.slice(0, 3).map((link) => (
                        <div key={link.id} className="p-2.5 rounded-lg bg-muted/40 border border-border/60 flex items-center justify-between text-xs">
                          <div className="truncate mr-2">
                            <p className="font-semibold text-foreground truncate">{link.brand_name}</p>
                            <span className="text-[10px] text-muted-foreground">{link.click_count} creator clicks</span>
                          </div>
                          <Badge variant="secondary" className="text-[10px] uppercase font-bold shrink-0">
                            {link.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Card 2: Creator Discovery */}
              <Card className="bg-card border-border shadow-sm flex flex-col hover:border-[#08739C]/40 transition-colors">
                <CardHeader className="pb-3">
                  <div className="h-10 w-10 rounded-xl bg-[#FC801A]/10 flex items-center justify-center text-[#FC801A] mb-3">
                    <Users className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg text-foreground">Creator Discovery</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Search creators filtered by product niche
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-2.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <CheckCircle2 className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8]" />
                    <span>Beauty, Skincare, Tech & Fitness creators</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <CheckCircle2 className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8]" />
                    <span>View portfolios & past brand sample videos</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <CheckCircle2 className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8]" />
                    <span>Direct contact with zero platform take-rate</span>
                  </div>
                  <div className="pt-2">
                    <Link
                      href="/for-brands"
                      className="text-xs font-semibold text-[#08739C] dark:text-[#38BDF8] hover:underline inline-flex items-center gap-1"
                    >
                      Open Creator Roster <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Card 3: Campaign Moderation Info */}
              <Card className="bg-card border-border shadow-sm flex flex-col hover:border-[#08739C]/40 transition-colors">
                <CardHeader className="pb-3">
                  <div className="h-10 w-10 rounded-xl bg-[#08739C]/10 flex items-center justify-center text-[#08739C] dark:text-[#38BDF8] mb-3">
                    <Clock className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg text-foreground">Fast Verification</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Ensuring real brands connect with authentic creators
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-2.5 text-xs text-muted-foreground">
                  <p className="leading-relaxed">
                    Submitted brand campaigns undergo quick verification to ensure legitimate product-for-review terms. Once verified, your campaign is broadcasted to active UGC creators.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/plans"
                      className="text-xs font-semibold text-[#08739C] dark:text-[#38BDF8] hover:underline inline-flex items-center gap-1"
                    >
                      Brand Account Features <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ROLE 3: SHOPPER / DEFAULT USER VIEW */}
        {/* ============================================================== */}
        {(role === 'USER' || (role !== 'CREATOR' && role !== 'BRAND')) && (
          <div>
            {/* Welcome Banner */}
            <div className="rounded-2xl p-6 sm:p-8 bg-card border border-border mb-10 shadow-sm relative overflow-hidden">
              <div className="relative z-10 max-w-2xl">
                <Badge variant="outline" className="border-[#08739C]/40 text-[#08739C] dark:text-[#38BDF8] bg-[#08739C]/10 mb-3 font-semibold">
                  <ShoppingBag className="w-3.5 h-3.5 mr-1.5" /> Shopper & Learner Plan (Free)
                </Badge>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                  Welcome back, {fullName}!
                </h1>
                <p className="mt-2 text-muted-foreground text-sm sm:text-base leading-relaxed">
                  Explore verified creator discounts, learn foundational UGC skills with free video lessons, and bookmark deals for later.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/for-shoppers"
                    className={cn(
                      buttonVariants({ size: 'sm' }),
                      'bg-[#FC801A] hover:bg-[#E66F0D] text-white border-0 shadow-sm font-medium'
                    )}
                  >
                    <Tag className="mr-1.5 h-4 w-4" /> Browse Verified Deals
                  </Link>
                  <Link
                    href="/plans"
                    className={cn(
                      buttonVariants({ variant: 'outline', size: 'sm' }),
                      'border-border hover:bg-accent text-foreground font-medium'
                    )}
                  >
                    Upgrade to Creator Plan <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* 3 Core Hub Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {/* Card 1: Saved For Later */}
              <Card className="bg-card border-border shadow-sm flex flex-col hover:border-[#08739C]/40 transition-colors">
                <CardHeader className="pb-3">
                  <div className="h-10 w-10 rounded-xl bg-[#08739C]/10 flex items-center justify-center text-[#08739C] dark:text-[#38BDF8] mb-3">
                    <Bookmark className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg text-foreground">Saved for Later</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Your bookmarked discount deals & tutorials
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/60 text-center">
                    <Bookmark className="h-6 w-6 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">No saved items yet.</p>
                    <p className="text-[11px] text-muted-foreground/70 mt-0.5">Click the bookmark icon on any deal or lesson to save it here.</p>
                  </div>
                </CardContent>
              </Card>

              {/* Card 2: Trending Creator Deals */}
              <Card className="bg-card border-border shadow-sm flex flex-col hover:border-[#08739C]/40 transition-colors">
                <CardHeader className="pb-3">
                  <div className="h-10 w-10 rounded-xl bg-[#FC801A]/10 flex items-center justify-center text-[#FC801A] mb-3">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg text-foreground">Creator Deals</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Exclusive affiliate discounts verified by creators
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-2.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <CheckCircle2 className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8]" />
                    <span>Up to 40% off top lifestyle & tech products</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <CheckCircle2 className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8]" />
                    <span>Direct promo codes tested and verified</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <CheckCircle2 className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8]" />
                    <span>Authentic creator reviews before you buy</span>
                  </div>
                  <div className="pt-2">
                    <Link
                      href="/for-shoppers"
                      className="text-xs font-semibold text-[#08739C] dark:text-[#38BDF8] hover:underline inline-flex items-center gap-1"
                    >
                      Explore All Deals <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Card 3: Free UGC Lessons */}
              <Card className="bg-card border-border shadow-sm flex flex-col hover:border-[#08739C]/40 transition-colors">
                <CardHeader className="pb-3">
                  <div className="h-10 w-10 rounded-xl bg-[#08739C]/10 flex items-center justify-center text-[#08739C] dark:text-[#38BDF8] mb-3">
                    <PlayCircle className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg text-foreground">Free UGC Academy</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Beginner guides for aspiring creators
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-2.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <BookOpen className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8]" />
                    <span>How to film product reviews with your phone</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <BookOpen className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8]" />
                    <span>Scripting 30s hooks that get engagement</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <BookOpen className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8]" />
                    <span>Lighting and basic CapCut video editing</span>
                  </div>
                  <div className="pt-2">
                    <Link
                      href="/for-creators"
                      className="text-xs font-semibold text-[#08739C] dark:text-[#38BDF8] hover:underline inline-flex items-center gap-1"
                    >
                      Watch Tutorials <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upgrade Banner for Creators */}
            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <Sparkles className="h-4 w-4 text-[#FC801A]" />
                  <span className="text-xs font-bold text-[#FC801A] uppercase tracking-wider">Ready to make content?</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-foreground">
                  Receive Products to Review & Monetize Your Videos
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
                  Upgrade to Creator Basic ($10/mo) to unlock direct brand collaboration campaigns, test products without paying, and publish your own affiliate links.
                </p>
              </div>
              <Link
                href="/plans"
                className={cn(
                  buttonVariants(),
                  'bg-[#FC801A] hover:bg-[#E66F0D] text-white border-0 shadow-sm font-semibold shrink-0 px-6 h-11'
                )}
              >
                View Creator Plans <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Decorative Bottom Border Ribbon */}
      <BrandBorder position="bottom" height="h-6 sm:h-8" />
    </div>
  )
}
