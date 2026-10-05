import Link from "next/link";
import { getCurrentUserRole } from "@/features/auth/actions";
import { getCategories, getCampaignLinks } from "@/features/links/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AddCampaignModal } from "@/features/links/components/add-campaign-modal";
import { ExternalLink, Building2, Package, Sparkles, Lock, ArrowRight } from "lucide-react";

export const dynamic = 'force-dynamic'

export const metadata = {
  title: "Brand Collabs | Menitap",
  description: "Browse brand collaboration campaigns, product review opportunities, and application links.",
};

export default async function CollabsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category: selectedCategorySlug } = await searchParams
  const role = await getCurrentUserRole()
  const isCreatorOrAdmin = role === 'CREATOR' || role === 'ADMIN'
  const isBrandOrAdmin = role === 'BRAND' || role === 'ADMIN'

  // Fetch CREATORS categories and active campaign links
  const categories = await getCategories('CREATORS')

  let activeCategoryId: number | undefined
  if (selectedCategorySlug) {
    const matched = categories.find((c) => c.slug === selectedCategorySlug)
    if (matched) activeCategoryId = matched.id
  }

  const campaigns = await getCampaignLinks(activeCategoryId)

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-[#FC801A]/30 selection:text-foreground">
      <SiteHeader currentPath="/collabs" />

      <main className="flex-1 py-10 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-border">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs bg-[#08739C]/10 text-[#08739C] dark:text-[#38BDF8] border-[#08739C]/30">
                  UGC Opportunities
                </Badge>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Brand Collabs
              </h1>
              <p className="mt-1 text-sm sm:text-base text-muted-foreground">
                Apply for brand campaigns, receive free products to test, and create authentic UGC reviews.
              </p>
            </div>

            {/* Brand / Admin Action Button: + Post Campaign */}
            {isBrandOrAdmin && (
              <div className="shrink-0 flex items-center gap-2">
                <AddCampaignModal categories={categories} />
              </div>
            )}
          </div>

          {/* Gating Callout Banner for Non-Creators (Visitors or Free Explorers) */}
          {!isCreatorOrAdmin && (
            <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#FC801A]/10 via-[#FC801A]/5 to-transparent border border-[#FC801A]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[#FC801A] font-bold text-sm">
                  <Lock className="h-4 w-4" />
                  <span>Creator Plan Required to Apply</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Browse brand collab opportunities below. Join <strong>Creator Basic ($10/mo)</strong> or <strong>Creator Standard ($15/mo)</strong> to unlock direct application links & receive free products.
                </p>
              </div>
              <Link
                href="/plans"
                className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 h-9 rounded-lg bg-[#FC801A] hover:bg-[#E66F0D] text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <span>View Creator Plans</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}

          {/* Categories Pill Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
            <Link
              href="/collabs"
              className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap ${
                !selectedCategorySlug
                  ? 'bg-[#08739C] text-white shadow-xs'
                  : 'bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              All Collabs ({campaigns.length})
            </Link>
            {categories.map((cat) => {
              const isSelected = selectedCategorySlug === cat.slug
              return (
                <Link
                  key={cat.id}
                  href={`/collabs?category=${cat.slug}`}
                  className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#08739C] text-white shadow-xs'
                      : 'bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {cat.name}
                </Link>
              )
            })}
          </div>

          {/* Campaigns Grid */}
          {campaigns.length === 0 ? (
            <Card className="bg-card border-dashed border-border py-16 text-center">
              <CardContent className="space-y-3">
                <Building2 className="h-10 w-10 text-muted-foreground mx-auto" />
                <CardTitle className="text-lg text-foreground">No Brand Collabs In This Category Yet</CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
                  {isBrandOrAdmin
                    ? 'Post the first product review campaign in this category to recruit creators!'
                    : 'Check back soon for new brand collaboration and product review campaigns.'}
                </p>
                {isBrandOrAdmin && (
                  <div className="pt-2 flex justify-center">
                    <AddCampaignModal categories={categories} />
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {campaigns.map((camp) => {
                const categoryName = (camp.categories as unknown as { name?: string })?.name || 'General'
                const brandOwner = (camp.profiles as unknown as { full_name?: string })?.full_name || 'Brand Partner'

                return (
                  <Card
                    key={camp.id}
                    className="bg-card border-border shadow-xs hover:border-[#08739C]/40 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <Badge variant="outline" className="text-[11px] bg-muted/60 text-muted-foreground border-border font-medium">
                          {categoryName}
                        </Badge>
                        {camp.products_provided && (
                          <Badge className="bg-[#08739C]/10 text-[#08739C] dark:text-[#38BDF8] border-[#08739C]/30 text-[11px] font-semibold flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            Free Product
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg text-foreground font-bold line-clamp-1">
                        {camp.brand_name}
                      </CardTitle>
                      {camp.description ? (
                        <p className="text-xs text-muted-foreground line-clamp-2 pt-1">
                          {camp.description}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground pt-1 flex items-center gap-1.5">
                          <Sparkles className="h-3 w-3 text-[#FC801A]" />
                          Posted by {brandOwner}
                        </p>
                      )}
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="pt-3 border-t border-border flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground">
                          {camp.click_count || 0} applications
                        </span>

                        {isCreatorOrAdmin ? (
                          <a
                            href={camp.application_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#08739C] hover:text-[#02547A] dark:text-[#38BDF8] hover:underline"
                          >
                            Apply / Collab
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        ) : (
                          <Link
                            href="/plans"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#FC801A] hover:underline"
                          >
                            <Lock className="h-3 w-3" />
                            Unlock Link
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
