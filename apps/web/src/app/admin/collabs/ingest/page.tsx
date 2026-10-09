import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getEffectiveUserContext } from '@/features/auth/actions'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/site-header'
import { BrandBorder } from '@/components/brand-border'
import { IngestForm } from './ingest-form'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Building2, CheckCircle2, ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Admin Collabs Ingestion | Menitap',
  description: 'Ingest brand collaboration briefs and casting digests.',
}

export default async function AdminCollabsIngestPage() {
  const { user, isAdmin } = await getEffectiveUserContext()

  // Guard: Admin only
  if (!user || !isAdmin) {
    redirect('/collabs')
  }

  const supabase = await createClient()

  // Fetch count stats
  const { data: activeCollabs } = await supabase
    .from('brand_links')
    .select('id, collab_type')
    .eq('status', 'ACTIVE')

  const totalActive = activeCollabs?.length || 0
  const totalRosters = activeCollabs?.filter((c) => c.collab_type === 'AMBASSADOR_ROSTER').length || 0
  const totalBriefs = activeCollabs?.filter((c) => c.collab_type === 'CASTING_BRIEF').length || 0

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-[#FC801A]/30 selection:text-foreground">
      <SiteHeader currentPath="/collabs" />

      <main className="flex-1 py-8 sm:py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link
                  href="/collabs"
                  className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  <span>Back to Collabs</span>
                </Link>
                <Badge variant="outline" className="text-[10px] uppercase font-bold text-[#FC801A] border-[#FC801A]/30">
                  Admin Tool
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Collabs Digest Ingestion
              </h1>
            </div>

            <Link
              href="/collabs"
              className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg border border-border hover:bg-muted text-xs font-semibold text-foreground transition-colors"
            >
              <Building2 className="h-3.5 w-3.5 text-[#08739C]" />
              <span>Live Collabs ({totalActive})</span>
            </Link>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="bg-card border-border p-3.5">
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-muted-foreground font-medium">Total Active Collabs</p>
                  <p className="text-xl font-bold text-foreground">{totalActive}</p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-emerald-500/80" />
              </CardContent>
            </Card>

            <Card className="bg-card border-border p-3.5">
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-muted-foreground font-medium">Campaign Briefs</p>
                  <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{totalBriefs}</p>
                </div>
                <Sparkles className="h-5 w-5 text-purple-500/80" />
              </CardContent>
            </Card>

            <Card className="bg-card border-border p-3.5">
              <CardContent className="p-0 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-muted-foreground font-medium">Ambassador Rosters</p>
                  <p className="text-xl font-bold text-sky-600 dark:text-sky-400">{totalRosters}</p>
                </div>
                <Building2 className="h-5 w-5 text-sky-500/80" />
              </CardContent>
            </Card>
          </div>

          {/* Ingest Form */}
          <IngestForm />
        </div>
      </main>

      <BrandBorder position="bottom" height="h-7 sm:h-9" />
    </div>
  )
}
