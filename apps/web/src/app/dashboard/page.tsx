import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser, signOut } from '@/features/auth/actions'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Video, Link as LinkIcon, Building2, Coins, ArrowRight, UserCheck, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  const email = user.email || 'Creator'
  const fullName = user.user_metadata?.full_name || email.split('@')[0]
  const role = user.user_metadata?.role || 'USER'

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Navbar */}
      <header className="border-b border-white/10 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-2xl font-bold text-transparent">
              Menitap
            </Link>
            <nav className="hidden sm:flex gap-4 text-sm text-zinc-400">
              <Link href="/dashboard" className="text-white font-medium">Dashboard</Link>
              <Link href="/#features" className="hover:text-white transition-colors">Deals</Link>
              <Link href="/#how-it-works" className="hover:text-white transition-colors">Academy</Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-medium text-white">{fullName}</span>
              <span className="text-[10px] text-zinc-400">{email}</span>
            </div>
            {role === 'ADMIN' && (
              <Badge className="bg-purple-600 text-white border-0 text-xs">Admin</Badge>
            )}
            <form action={signOut}>
              <Button variant="ghost" size="sm" type="submit" className="text-zinc-400 hover:text-white hover:bg-white/5">
                <LogOut className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-6xl">
        {/* Welcome Banner */}
        <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-white/10 mb-10 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="border-purple-500/40 text-purple-300 bg-purple-500/10">
                Buyer-User Tier (Free)
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
              Welcome back, {fullName}!
            </h1>
            <p className="mt-2 text-zinc-300 max-w-xl text-sm sm:text-base">
              Explore curated educational videos, discover discounted products, and upgrade whenever you are ready to publish UGC brand deals.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/#pricing"
                className={cn(buttonVariants({ size: 'sm' }), 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0')}
              >
                Upgrade to Basic or Standard <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <Card className="bg-zinc-950 border-white/10">
            <CardHeader className="pb-2">
              <CardDescription className="text-zinc-400 flex items-center justify-between">
                <span>Current Plan</span>
                <UserCheck className="h-4 w-4 text-blue-400" />
              </CardDescription>
              <CardTitle className="text-xl font-bold text-white">Free Buyer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-zinc-500">Access to free videos & affiliate deals</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-950 border-white/10">
            <CardHeader className="pb-2">
              <CardDescription className="text-zinc-400 flex items-center justify-between">
                <span>Earned Points</span>
                <Coins className="h-4 w-4 text-yellow-400" />
              </CardDescription>
              <CardTitle className="text-xl font-bold text-white">0 pts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-zinc-500">Upgrade to earn subscription discount points</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-950 border-white/10">
            <CardHeader className="pb-2">
              <CardDescription className="text-zinc-400 flex items-center justify-between">
                <span>Affiliate Links</span>
                <LinkIcon className="h-4 w-4 text-purple-400" />
              </CardDescription>
              <CardTitle className="text-xl font-bold text-white">0 links</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-zinc-500">Available on Basic & Standard plans</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-950 border-white/10">
            <CardHeader className="pb-2">
              <CardDescription className="text-zinc-400 flex items-center justify-between">
                <span>Brand Deals</span>
                <Building2 className="h-4 w-4 text-emerald-400" />
              </CardDescription>
              <CardTitle className="text-xl font-bold text-white">0 applied</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-zinc-500">Available on Standard plan ($10/mo)</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-zinc-950 border-white/10">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <Video className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-white">UGC Academy</CardTitle>
                  <CardDescription className="text-zinc-400">Learn how to film, edit, and pitch brand deals</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-zinc-300">
                Start watching our foundational lessons on creating authentic user-generated content for TikTok, Instagram Reels, and YouTube Shorts.
              </p>
              <Link href="/#how-it-works" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'border-white/10 text-white hover:bg-white/5')}>
                Watch Free Tutorials
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-zinc-950 border-white/10">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-white">Become a UGC Creator</CardTitle>
                  <CardDescription className="text-zinc-400">Unlock brand applications & product gifting</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-zinc-300">
                Upgrade to the Standard Plan to access direct brand links, apply for product gifting campaigns, and produce paid UGC videos.
              </p>
              <Link href="/#pricing" className={cn(buttonVariants({ size: 'sm' }), 'bg-white text-black hover:bg-zinc-200')}>
                View Creator Plans
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
