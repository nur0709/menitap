import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser, signOut } from '@/features/auth/actions'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BrandBorder } from '@/components/brand-border'
import { BrandLogo } from '@/components/brand-logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserAvatar } from '@/components/user-avatar'
import { LogOut, ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'My Account | Menitap',
  description: 'My Account overview',
}

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const email = user.email || ''
  const fullName = profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || ''
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture || null

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors selection:bg-[#FC801A]/30">
      <BrandBorder position="top" height="h-7 sm:h-9" />

      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <BrandLogo size="md" />
            <nav className="hidden sm:flex gap-4 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" /> Home
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
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

      {/* Main empty/clean My Account page */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-2xl flex-1 flex flex-col justify-center">
        <Card className="bg-card border-border shadow-sm text-center py-10 px-6">
          <CardHeader className="flex flex-col items-center gap-4">
            <UserAvatar user={{ email, fullName, avatarUrl }} size="lg" />
            <div>
              <CardTitle className="text-3xl font-extrabold text-foreground">My Account</CardTitle>
              {email && <p className="text-sm text-muted-foreground mt-1">{email}</p>}
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Account content will be configured here.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Link href="/">
                <Button variant="outline" className="border-border hover:bg-accent">
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      <BrandBorder position="bottom" height="h-7 sm:h-9" />
    </div>
  )
}
