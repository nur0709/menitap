import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { getCategories } from '@/features/links/actions'
import { PostCollabForm } from './post-collab-form'
import { Sparkles, Users, Video, ShieldCheck } from 'lucide-react'

export const metadata = {
  title: 'Post a Brand Collab | Menitap',
  description: 'Connect with authentic UGC creators. Post your product review or sponsorship campaign for free.',
}

interface PostCollabPageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function PostCollabPage({ searchParams }: PostCollabPageProps) {
  const { category } = await searchParams
  const categories = await getCategories('BRANDS')

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-[#FC801A]/30 selection:text-foreground">
      <SiteHeader currentPath="/post-collab" />

      <main className="flex-1 py-10 sm:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          {/* Header */}
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FC801A]/10 text-[#FC801A] text-xs font-semibold mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>For Brands & Agencies</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Find UGC creators for your brand.
            </h1>
            <p className="mt-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Post your product review campaign or application form directly to creators on Menitap. 100% free placement with zero platform fees.
            </p>
          </div>

          {/* 3 Quick Value Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            <div className="p-3.5 rounded-xl bg-card border border-border text-center">
              <Users className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8] mx-auto mb-1.5" />
              <p className="text-xs font-bold text-foreground">Targeted Creators</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Reach niche creators ready to test products</p>
            </div>
            <div className="p-3.5 rounded-xl bg-card border border-border text-center">
              <Video className="h-4 w-4 text-[#FC801A] mx-auto mb-1.5" />
              <p className="text-xs font-bold text-foreground">Direct Applications</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Creators apply straight to your form or portal</p>
            </div>
            <div className="p-3.5 rounded-xl bg-card border border-border text-center">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mx-auto mb-1.5" />
              <p className="text-xs font-bold text-foreground">Zero Placement Fee</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Free MVP listing with fast verification</p>
            </div>
          </div>

          {/* Form */}
          <PostCollabForm categories={categories} defaultCategorySlug={category} />
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
