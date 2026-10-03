import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/features/auth/actions'
import { getCategories } from '@/features/links/actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
    <div className="min-h-screen bg-black text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Back navigation */}
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-zinc-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Dashboard
        </Link>

        {/* Tab switch */}
        <div className="flex bg-zinc-900 border border-white/10 rounded-xl p-1 mb-8">
          <Link
            href="/dashboard/submit?type=affiliate"
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              type !== 'brand'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <LinkIcon className="h-4 w-4" />
            <span>Affiliate Product Deal</span>
          </Link>
          <Link
            href="/dashboard/submit?type=brand"
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              type === 'brand'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>Brand Collab Opportunity</span>
          </Link>
        </div>

        {/* Form Container */}
        <Card className="bg-zinc-950 border-white/10 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl text-white">
              {type === 'brand' ? 'Submit a Brand Collaboration Link' : 'Submit an Affiliate Product Deal'}
            </CardTitle>
            <CardDescription className="text-zinc-400">
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
      </div>
    </div>
  )
}
