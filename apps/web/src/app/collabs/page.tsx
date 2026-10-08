import Link from "next/link";
import { getEffectiveUserContext } from "@/features/auth/actions";
import { getCategories, getCampaignLinks } from "@/features/links/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { BrandBorder } from "@/components/brand-border";
import { AddCampaignModal } from "@/features/links/components/add-campaign-modal";
import { DeleteCollabButton } from "@/features/links/components/delete-collab-button";
import { BrandLogoBadge } from "@/features/links/components/brand-logo-badge";
import { TrackCollabButton } from "@/features/links/components/track-collab-button";
import { ExternalLink, Building2, Package, Lock, DollarSign, Calendar, CheckCircle2, ArrowRight } from "lucide-react";

export const dynamic = 'force-dynamic'

export const metadata = {
  title: "Brand Collabs | Menitap",
  description: "Browse brand collaboration campaigns and product review opportunities.",
};

export default async function CollabsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category: selectedCategorySlug } = await searchParams
  const { user, role, isAdmin } = await getEffectiveUserContext()
  const isCreatorOrAdmin = role === 'CREATOR' || isAdmin
  const isBrandOrAdmin = role === 'BRAND' || isAdmin
  const currentUserId = user?.id || null

  // Fetch categories and active campaign links
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

      <main className="flex-1 py-8 sm:py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          {/* Minimalist Toolbar: Title + Action */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Brand Collabs
            </h1>

            <div className="flex items-center gap-2 shrink-0">
              {isBrandOrAdmin ? (
                <AddCampaignModal categories={categories} />
              ) : (
                <Link
                  href="/post-collab"
                  className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-lg border border-border hover:bg-muted text-xs font-semibold text-foreground transition-colors"
                >
                  <Building2 className="h-3.5 w-3.5 text-[#08739C] dark:text-[#38BDF8]" />
                  <span>Post a Collab</span>
                </Link>
              )}
            </div>
          </div>

          {/* Minimalist 1-Line Gating Ribbon for Visitors / Explorers */}
          {!isCreatorOrAdmin && (
            <div className="mb-5 px-3.5 py-2 rounded-xl bg-[#FC801A]/5 border border-[#FC801A]/20 flex items-center justify-between gap-2 text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5 truncate">
                <Lock className="h-3.5 w-3.5 text-[#FC801A] shrink-0" />
                <span>Creator membership required to apply for campaigns.</span>
              </span>
              <Link
                href="/plans"
                className="shrink-0 font-semibold text-[#FC801A] hover:underline inline-flex items-center gap-1"
              >
                <span>View Plans</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}

          {/* Minimalist Categories Pill Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
            <Link
              href="/collabs"
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap ${
                !selectedCategorySlug
                  ? 'bg-[#08739C] text-white'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              All {!selectedCategorySlug ? `(${campaigns.length})` : ''}
            </Link>
            {categories.map((cat) => {
              const isSelected = selectedCategorySlug === cat.slug
              return (
                <Link
                  key={cat.id}
                  href={`/collabs?category=${cat.slug}`}
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

          {/* Campaigns Grid */}
          {campaigns.length === 0 ? (
            <Card className="bg-card border-dashed border-border py-12 text-center">
              <CardContent className="space-y-2">
                <Building2 className="h-8 w-8 text-muted-foreground mx-auto" />
                <CardTitle className="text-base text-foreground">No collabs in this category yet</CardTitle>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Check back soon for new brand collaboration and product review campaigns.
                </p>
                {isBrandOrAdmin && (
                  <div className="pt-2 flex justify-center">
                    <AddCampaignModal categories={categories} />
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaigns.map((camp) => {
                const categoryName = (camp.categories as unknown as { name?: string })?.name || 'General'
                const canDelete = isAdmin || (Boolean(currentUserId) && camp.user_id === currentUserId)

                return (
                  <Card
                    key={camp.id}
                    className="group bg-card border-border shadow-xs hover:border-[#08739C]/40 hover:shadow-sm transition-all flex flex-col justify-between"
                  >
                    <CardHeader className="p-4 pb-2 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-medium text-muted-foreground">
                          {categoryName}
                        </span>
                        {camp.products_provided && (
                          <Badge className="bg-[#08739C]/10 text-[#08739C] dark:text-[#38BDF8] border-[#08739C]/30 text-[10px] font-medium px-2 py-0">
                            <Package className="h-3 w-3 mr-1" />
                            Free Product
                          </Badge>
                        )}
                      </div>

                      {/* Brand Logo / Monogram + Brand Name & Details */}
                      <div className="flex items-start gap-3">
                        <BrandLogoBadge
                          brandName={camp.brand_name}
                          applicationUrl={camp.application_url}
                          imageUrl={camp.image_url}
                        />
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base text-foreground font-semibold line-clamp-1 leading-snug">
                            {camp.brand_name}
                          </CardTitle>
                          {camp.description ? (
                            <p className="text-xs text-muted-foreground line-clamp-4 pt-1 leading-relaxed">
                              {camp.description}
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground/70 italic pt-0.5">
                              Accepting creator applications
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Compensation, Deliverables & Deadline Badges */}
                      {(camp.compensation_details || camp.deliverables || camp.deadline || camp.is_verified) && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {camp.compensation_details && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                              <DollarSign className="h-2.5 w-2.5" />
                              {camp.compensation_details}
                            </span>
                          )}
                          {camp.deliverables && (
                            <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                              {camp.deliverables}
                            </span>
                          )}
                          {camp.deadline && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                              <Calendar className="h-2.5 w-2.5" />
                              Due {new Date(camp.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                          {camp.is_verified && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#08739C] dark:text-[#38BDF8] bg-[#08739C]/10 px-1.5 py-0.5 rounded-md">
                              <CheckCircle2 className="h-2.5 w-2.5" />
                              Verified
                            </span>
                          )}
                        </div>
                      )}
                    </CardHeader>

                    <CardContent className="p-4 pt-2">
                      <div className="pt-2.5 border-t border-border flex items-center justify-between gap-2">
                        <div>
                          {canDelete && (
                            <DeleteCollabButton campaignId={camp.id} brandName={camp.brand_name} />
                          )}
                        </div>

                        <div>
                          {isCreatorOrAdmin ? (
                            <div className="flex items-center gap-2">
                              <TrackCollabButton collabId={camp.id} />
                              <a
                                href={camp.application_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#08739C] hover:bg-[#02547A] text-white transition-colors cursor-pointer"
                              >
                                Apply
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          ) : (
                            <Link
                              href="/plans"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-[#FC801A] hover:underline"
                            >
                              <Lock className="h-3 w-3" />
                              Join to Apply
                            </Link>
                          )}
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

      <BrandBorder position="bottom" height="h-7 sm:h-9" />
    </div>
  );
}
