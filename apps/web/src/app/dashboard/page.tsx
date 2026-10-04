import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser, signOut } from '@/features/auth/actions'
import { getUserLinks } from '@/features/links/actions'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BrandBorder } from '@/components/brand-border'
import { BrandLogo } from '@/components/brand-logo'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  Video,
  Link as LinkIcon,
  Building2,
  ArrowRight,
  UserCheck,
  LogOut,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  const { submitted } = await searchParams
  const email = user.email || 'Creator'
  const fullName = user.user_metadata?.full_name || email.split('@')[0]
  const role = user.user_metadata?.role || 'USER'

  const { affiliateLinks, brandLinks } = await getUserLinks()

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors">
      {/* Decorative Top Border Ribbon */}
      <BrandBorder position="top" height="h-6 sm:h-8" />

      {/* Top Navbar */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <BrandLogo size="md" />
            <nav className="hidden sm:flex gap-4 text-sm text-muted-foreground">
              <Link href="/dashboard" className="text-foreground font-semibold">Dashboard</Link>
              <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
              <Link href="/plans" className="hover:text-foreground transition-colors">Plans</Link>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />

            <Link
              href="/dashboard/submit"
              className={cn(
                buttonVariants({ size: 'sm' }), 
                'bg-[#FC801A] hover:bg-[#E66F0D] text-white border-0 shadow-sm'
              )}
            >
              <PlusCircle className="h-4 w-4 mr-1.5" />
              <span>Submit Link</span>
            </Link>

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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-6xl flex-1">
        {/* Success Alert if just submitted */}
        {submitted && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <p className="text-sm">
                <span className="font-semibold">Successfully submitted!</span> Your{' '}
                {submitted === 'brand' ? 'brand collab opportunity' : 'affiliate deal'} is now in review and will appear publicly once approved.
              </p>
            </div>
            <Link href="/dashboard" className="text-xs text-emerald-700 dark:text-emerald-300 hover:underline shrink-0 ml-4 font-medium">
              Dismiss
            </Link>
          </div>
        )}

        {/* Welcome Banner */}
        <div className="rounded-2xl p-6 sm:p-8 bg-card border border-border mb-10 shadow-sm">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="border-[#08739C]/40 text-[#08739C] dark:text-[#38BDF8] bg-[#08739C]/10">
                Buyer-User Tier (Free)
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground">
              Welcome back, {fullName}!
            </h1>
            <p className="mt-2 text-muted-foreground max-w-xl text-sm sm:text-base">
              Submit affiliate links for products you love, or direct brand collaboration links to help creators discover opportunities.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/dashboard/submit"
                className={cn(
                  buttonVariants({ size: 'sm' }), 
                  'bg-[#FC801A] hover:bg-[#E66F0D] text-white border-0 shadow-sm'
                )}
              >
                <PlusCircle className="mr-1.5 h-4 w-4" /> Submit a Deal or Brand Link
              </Link>
              <Link
                href="/plans"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'sm' }), 
                  'border-border hover:bg-accent text-foreground'
                )}
              >
                Upgrade to Basic or Standard <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="text-muted-foreground flex items-center justify-between">
                <span>Current Plan</span>
                <UserCheck className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8]" />
              </CardDescription>
              <CardTitle className="text-xl font-bold text-foreground">Free Buyer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Access to free videos & affiliate deals</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="text-muted-foreground flex items-center justify-between">
                <span>Affiliate Links</span>
                <LinkIcon className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8]" />
              </CardDescription>
              <CardTitle className="text-xl font-bold text-foreground">{affiliateLinks.length} submitted</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Product discount deals you shared</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="text-muted-foreground flex items-center justify-between">
                <span>Brand Collabs</span>
                <Building2 className="h-4 w-4 text-[#FC801A]" />
              </CardDescription>
              <CardTitle className="text-xl font-bold text-foreground">{brandLinks.length} submitted</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Creator collaboration links</p>
            </CardContent>
          </Card>
        </div>

        {/* User Submitted Links Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">My Submitted Links</h2>
            <Link
              href="/dashboard/submit"
              className="text-xs text-[#FC801A] hover:underline font-medium inline-flex items-center gap-1"
            >
              <PlusCircle className="h-3.5 w-3.5" /> Submit New Link
            </Link>
          </div>

          {affiliateLinks.length === 0 && brandLinks.length === 0 ? (
            <Card className="bg-card border-border p-8 text-center shadow-sm">
              <p className="text-muted-foreground text-sm mb-4">You haven&apos;t submitted any links yet.</p>
              <Link
                href="/dashboard/submit"
                className={cn(
                  buttonVariants({ size: 'sm' }), 
                  'bg-[#FC801A] hover:bg-[#E66F0D] text-white border-0 shadow-sm'
                )}
              >
                Submit Your First Deal or Brand Link
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Affiliate links list */}
              {affiliateLinks.map((link) => (
                <div
                  key={`aff-${link.id}`}
                  className="p-4 rounded-xl bg-card border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:border-[#08739C]/40 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#08739C]/10 text-[#08739C] dark:text-[#38BDF8] border border-[#08739C]/20">
                        Affiliate Deal
                      </span>
                      {link.status === 'PENDING' && (
                        <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-300 bg-amber-500/10 text-xs">
                          <Clock className="h-3 w-3 mr-1" /> Pending Review
                        </Badge>
                      )}
                      {link.status === 'APPROVED' && (
                        <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 dark:text-emerald-300 bg-emerald-500/10 text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Approved
                        </Badge>
                      )}
                      {link.status === 'REJECTED' && (
                        <Badge variant="outline" className="border-rose-500/40 text-rose-600 dark:text-rose-300 bg-rose-500/10 text-xs">
                          <XCircle className="h-3 w-3 mr-1" /> Rejected
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground">{link.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {link.discount_percentage ? `${link.discount_percentage}% off • ` : ''}
                      {link.promo_code ? `Code: ${link.promo_code} • ` : ''}
                      {new Date(link.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <a
                    href={link.product_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs text-[#08739C] dark:text-[#38BDF8] hover:underline font-medium gap-1 sm:self-center"
                  >
                    View Link <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ))}

              {/* Brand links list */}
              {brandLinks.map((link) => (
                <div
                  key={`brand-${link.id}`}
                  className="p-4 rounded-xl bg-card border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:border-[#FC801A]/40 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#FC801A]/10 text-[#FC801A] border border-[#FC801A]/20">
                        Brand Collaboration
                      </span>
                      {link.status === 'PENDING' && (
                        <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-300 bg-amber-500/10 text-xs">
                          <Clock className="h-3 w-3 mr-1" /> Pending Review
                        </Badge>
                      )}
                      {link.status === 'APPROVED' && (
                        <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 dark:text-emerald-300 bg-emerald-500/10 text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Approved
                        </Badge>
                      )}
                      {link.status === 'REJECTED' && (
                        <Badge variant="outline" className="border-rose-500/40 text-rose-600 dark:text-rose-300 bg-rose-500/10 text-xs">
                          <XCircle className="h-3 w-3 mr-1" /> Rejected
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground">{link.brand_name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {link.products_provided ? 'Free products provided • ' : ''}
                      {new Date(link.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <a
                    href={link.application_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs text-[#FC801A] hover:underline font-medium gap-1 sm:self-center"
                  >
                    View Application <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-[#08739C]/10 dark:bg-[#08739C]/20 flex items-center justify-center text-[#08739C] dark:text-[#38BDF8]">
                  <Video className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-foreground">UGC Academy</CardTitle>
                  <CardDescription className="text-muted-foreground">Learn how to film, edit, and pitch brand deals</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Start watching our foundational lessons on creating authentic user-generated content for TikTok, Instagram Reels, and YouTube Shorts.
              </p>
              <Link href="/about" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'border-border text-foreground hover:bg-accent')}>
                Watch Free Tutorials
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-[#FC801A]/10 dark:bg-[#FC801A]/20 flex items-center justify-center text-[#FC801A]">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-foreground">Become a UGC Creator</CardTitle>
                  <CardDescription className="text-muted-foreground">Unlock brand applications & products for review</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Upgrade to the Standard Plan to access direct brand links, apply for product-for-review campaigns, and produce paid UGC videos.
              </p>
              <Link href="/plans" className={cn(buttonVariants({ size: 'sm' }), 'bg-[#08739C] hover:bg-[#02547A] text-white border-0 shadow-sm')}>
                View Creator Plans
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Decorative Bottom Border Ribbon */}
      <BrandBorder position="bottom" height="h-6 sm:h-8" />
    </div>
  )
}
