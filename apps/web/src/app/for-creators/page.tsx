import Link from "next/link";
import { getCurrentUserRole } from "@/features/auth/actions";
import { getCategories, getCampaignLinks } from "@/features/links/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrandBorder } from "@/components/brand-border";
import { BrandLogo } from "@/components/brand-logo";
import { AuthNav } from "@/components/auth-nav";
import { MainNav } from "@/components/main-nav";
import { AddCampaignModal } from "@/features/links/components/add-campaign-modal";
import { ExternalLink, Building2, Package, Sparkles } from "lucide-react";

export const dynamic = 'force-dynamic'

export const metadata = {
  title: "Campaign Links | Menitap",
  description: "Browse brand collaboration campaigns, product review opportunities, and application links.",
};

export default async function ForCreatorsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category: selectedCategorySlug } = await searchParams
  const role = await getCurrentUserRole()
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
      {/* Decorative Top Border Ribbon */}
      <BrandBorder position="top" height="h-7 sm:h-9" />

      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md transition-colors">
        <div className="container mx-auto flex h-18 sm:h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
          <BrandLogo size="md" />
          <MainNav currentPath="/for-creators" />
          <AuthNav />
        </div>
      </header>

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
                Campaign Links
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

          {/* Categories Pill Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
            <Link
              href="/for-creators"
              className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap ${
                !selectedCategorySlug
                  ? 'bg-[#08739C] text-white shadow-xs'
                  : 'bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              All Campaigns ({campaigns.length})
            </Link>
            {categories.map((cat) => {
              const isSelected = selectedCategorySlug === cat.slug
              return (
                <Link
                  key={cat.id}
                  href={`/for-creators?category=${cat.slug}`}
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
                <CardTitle className="text-lg text-foreground">No Campaigns In This Category Yet</CardTitle>
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
                        <a
                          href={camp.application_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#08739C] hover:text-[#02547A] dark:text-[#38BDF8] hover:underline"
                        >
                          Apply / Collab
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* Decorative Bottom Border Ribbon */}
      <BrandBorder position="bottom" height="h-7 sm:h-9" />

      {/* Footer */}
      <footer className="bg-card border-t border-border py-10 transition-colors">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <BrandLogo size="md" />
          <p className="text-sm text-muted-foreground">
            © 2026 Menitap. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link href="/plans" className="hover:text-foreground transition-colors">Plans</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
