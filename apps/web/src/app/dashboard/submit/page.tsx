import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/features/auth/actions'
import { getCategories } from '@/features/links/actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BrandBorder } from '@/components/brand-border'
import { BrandLogo } from '@/components/brand-logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { AffiliateLinkForm } from '@/features/links/components/affiliate-link-form'
import { BrandLinkForm } from '@/features/links/components/brand-link-form'
import { ArrowLeft, Link as LinkIcon, Building2 } from 'lucide-react'

export default async function SubmitLinkPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/sign-in')
  }

  const { type = 'affiliate' } = await searchParams
  const categories = await getCategories()

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors">
      {/* Decorative Top Border Ribbon */}
      <BrandBorder position="top" height="h-6 sm:h-8" />

      {/* Top Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between max-w-4xl">
          <BrandLogo size="md" />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/dashboard"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-2xl flex-1">
        {/* Tab switch */}
        <div className="flex bg-muted/60 border border-border rounded-xl p-1 mb-8 shadow-sm">
          <Link
            href="/dashboard/submit?type=affiliate"
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              type !== 'brand'
                ? 'bg-[#08739C] text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LinkIcon className="h-4 w-4" />
            <span>Affiliate Product Deal</span>
          </Link>
          <Link
            href="/dashboard/submit?type=brand"
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              type === 'brand'
                ? 'bg-[#FC801A] text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>Brand Collab Opportunity</span>
          </Link>
        </div>

        {/* Form Container */}
        <Card className="bg-card border-border shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl text-foreground">
              {type === 'brand' ? 'Submit a Brand Collaboration Link' : 'Submit an Affiliate Product Deal'}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {type === 'brand'
                ? 'Share a direct link where creators apply to receive products for UGC content and earn reward points.'
                : 'Share an affiliate discount link for a great product with the Menitap community.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {type === 'brand' ? (
              <BrandLinkForm categories={categories} />
            ) : (
              <AffiliateLinkForm categories={categories} />
            )}
          </CardContent>
        </Card>
      </main>

      {/* Decorative Bottom Border Ribbon */}
      <BrandBorder position="bottom" height="h-6 sm:h-8" />
    </div>
  )
}
