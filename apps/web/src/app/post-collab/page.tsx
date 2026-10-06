import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { getCategories } from '@/features/links/actions'
import { createClient } from '@/lib/supabase/server'
import { PostCollabForm } from './post-collab-form'

export const metadata = {
  title: 'Post a Collab | Menitap',
  description: 'Share your campaign link with UGC creators. Free placement.',
}

interface PostCollabPageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function PostCollabPage({ searchParams }: PostCollabPageProps) {
  const { category } = await searchParams
  const categories = await getCategories('CREATORS')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-[#FC801A]/30 selection:text-foreground">
      <SiteHeader currentPath="/post-collab" />

      <main className="flex-1 py-10 sm:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
          {/* Minimalist Title */}
          <div className="text-center max-w-lg mx-auto mb-8 sm:mb-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Post a Collab
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
              Share your campaign link with UGC creators. 100% free placement.
            </p>
          </div>

          {/* Form */}
          <PostCollabForm
            categories={categories}
            defaultCategorySlug={category}
            userEmail={user?.email}
          />
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
