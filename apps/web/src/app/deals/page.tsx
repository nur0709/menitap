import Link from "next/link";
import { getEffectiveUserContext } from "@/features/auth/actions";
import { getCategories, getExploreDeals } from "@/features/links/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AddDealModal } from "@/features/links/components/add-deal-modal";
import { DeleteDealButton } from "@/features/links/components/delete-deal-button";
import { PromoCodeBadge } from "@/features/links/components/promo-code-badge";
import { DealThumbnail } from "@/features/links/components/deal-thumbnail";
import { ExternalLink, ShoppingBag } from "lucide-react";

export const dynamic = 'force-dynamic'

export const metadata = {
  title: "Deals | Menitap",
  description: "Browse verified creator affiliate deals and promo codes.",
};

export default async function DealsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category: selectedCategorySlug } = await searchParams
  const { user, role, isAdmin } = await getEffectiveUserContext()
  const isCreatorOrAdmin = role === 'CREATOR' || isAdmin
  const currentUserId = user?.id || null

  // Fetch categories and active deals
  const categories = await getCategories('DEALS')

  let activeCategoryId: number | undefined
  if (selectedCategorySlug) {
    const matched = categories.find((c) => c.slug === selectedCategorySlug)
    if (matched) activeCategoryId = matched.id
  }

  const deals = await getExploreDeals(activeCategoryId)

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-[#FC801A]/30 selection:text-foreground">
      <SiteHeader currentPath="/deals" />

      <main className="flex-1 py-8 sm:py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          {/* Minimalist Toolbar: Title + Action */}
          <div className="flex items-center justify-between gap-4 mb-5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Deals
            </h1>

            {isCreatorOrAdmin && (
              <div className="shrink-0">
                <AddDealModal categories={categories} />
              </div>
            )}
          </div>

          {/* Minimalist Categories Pill Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
            <Link
              href="/deals"
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap ${
                !selectedCategorySlug
                  ? 'bg-[#08739C] text-white'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              All ({deals.length})
            </Link>
            {categories.map((cat) => {
              const isSelected = selectedCategorySlug === cat.slug
              return (
                <Link
                  key={cat.id}
                  href={`/deals?category=${cat.slug}`}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#08739C] text-white'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {cat.name}
                </Link>
              )
            })}
          </div>

          {/* Deals Grid */}
          {deals.length === 0 ? (
            <Card className="bg-card border-dashed border-border py-12 text-center">
              <CardContent className="space-y-2">
                <ShoppingBag className="h-8 w-8 text-muted-foreground mx-auto" />
                <CardTitle className="text-base text-foreground">No deals in this category yet</CardTitle>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  {isCreatorOrAdmin
                    ? 'Share an affiliate deal to feature it here.'
                    : 'Check back soon for new discounts and promo codes.'}
                </p>
                {isCreatorOrAdmin && (
                  <div className="pt-2 flex justify-center">
                    <AddDealModal categories={categories} />
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {deals.map((deal) => {
                const categoryName = (deal.categories as unknown as { name?: string })?.name || 'General'
                const creatorName = (deal.profiles as unknown as { full_name?: string })?.full_name
                const canDelete = isAdmin || (Boolean(currentUserId) && (deal as unknown as { user_id?: string | null }).user_id === currentUserId)

                return (
                  <Card
                    key={deal.id}
                    className="group bg-card border-border shadow-xs hover:border-[#08739C]/40 hover:shadow-sm transition-all flex flex-col justify-between"
                  >
                    <CardHeader className="p-4 pb-2 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-medium text-muted-foreground">
                          {categoryName}
                        </span>
                        {deal.promo_code && (
                          <PromoCodeBadge code={deal.promo_code} />
                        )}
                      </div>

                      {/* Compact Thumbnail + Title & Creator Layout */}
                      <div className="flex items-start gap-3">
                        <DealThumbnail
                          imageUrl={(deal as unknown as { image_url?: string | null }).image_url}
                          title={deal.title || 'Deal'}
                        />
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm sm:text-base text-foreground font-semibold line-clamp-2 leading-snug">
                            {deal.title}
                          </CardTitle>
                          {creatorName && (
                            <p className="text-[11px] text-muted-foreground pt-1 flex items-center gap-1 truncate">
                              <span>Shared by</span>
                              <span className="font-medium text-foreground">{creatorName}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-4 pt-2">
                      <div className="pt-2.5 border-t border-border flex items-center justify-between gap-2">
                        <div>
                          {canDelete && (
                            <DeleteDealButton dealId={deal.id} dealTitle={deal.title} />
                          )}
                        </div>
                        <div>
                          <a
                            href={deal.product_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#08739C] hover:bg-[#02547A] text-white transition-colors cursor-pointer"
                          >
                            View Deal
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
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
