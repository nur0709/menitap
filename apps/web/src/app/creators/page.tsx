import Link from "next/link";
import { getPublicCreators } from "@/features/links/actions";
import { getEffectiveUserContext } from "@/features/auth/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { UserAvatar } from "@/components/user-avatar";
import { InstagramLogo, TikTokLogo, YouTubeLogo } from "@/components/social-icons";
import { Users, Sparkles, ArrowRight, Check } from "lucide-react";

export const dynamic = 'force-dynamic'

export const metadata = {
  title: "Creators | Menitap",
  description: "Browse verified UGC creator portfolios and social media channels.",
};

export default async function CreatorsPage() {
  const [creators, context] = await Promise.all([
    getPublicCreators(),
    getEffectiveUserContext(),
  ])

  const { role, effectivePlan } = context
  const isStandardCreator = (role === 'CREATOR' && effectivePlan === 'STANDARD') || role === 'ADMIN'

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-[#FC801A]/30 selection:text-foreground">
      <SiteHeader currentPath="/creators" />

      <main className="flex-1 py-8 sm:py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          {/* Minimalist Title */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Creators
            </h1>
            <span className="text-xs text-muted-foreground font-medium">
              {creators.length} {creators.length === 1 ? 'creator' : 'creators'}
            </span>
          </div>

          {/* Minimalist 1-Line Status Ribbon */}
          {isStandardCreator ? (
            <div className="mb-6 px-3.5 py-2 rounded-xl bg-[#08739C]/5 border border-[#08739C]/20 flex items-center justify-between gap-2 text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5 truncate">
                <Check className="h-3.5 w-3.5 text-[#08739C] dark:text-[#38BDF8] shrink-0" />
                <span>Your Creator Standard portfolio is active.</span>
              </span>
              <Link
                href="/dashboard"
                className="shrink-0 font-semibold text-[#08739C] dark:text-[#38BDF8] hover:underline inline-flex items-center gap-1"
              >
                <span>Edit Portfolio</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ) : (
            <div className="mb-6 px-3.5 py-2 rounded-xl bg-[#FC801A]/5 border border-[#FC801A]/20 flex items-center justify-between gap-2 text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5 truncate">
                <Sparkles className="h-3.5 w-3.5 text-[#FC801A] shrink-0" />
                <span>Feature your UGC portfolio and social links here.</span>
              </span>
              <Link
                href="/plans"
                className="shrink-0 font-semibold text-[#FC801A] hover:underline inline-flex items-center gap-1"
              >
                <span>Standard ($15/mo)</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}

          {/* Creators Directory Grid */}
          {creators.length === 0 ? (
            <Card className="bg-card border-dashed border-border py-12 text-center">
              <CardContent className="space-y-2">
                <Users className="h-8 w-8 text-muted-foreground mx-auto" />
                <CardTitle className="text-base text-foreground">No creator portfolios yet</CardTitle>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Creator Standard members who enable their portfolio will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {creators.map((creator) => {
                const displayName = creator.full_name || 'UGC Creator'

                return (
                  <Card
                    key={creator.id}
                    className="bg-card border-border shadow-xs hover:border-[#FC801A]/40 transition-colors flex flex-col justify-between"
                  >
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          user={{
                            fullName: creator.full_name,
                            avatarUrl: creator.avatar_url,
                          }}
                          size="md"
                        />
                        <div className="min-w-0">
                          <CardTitle className="text-base font-bold text-foreground truncate">
                            {displayName}
                          </CardTitle>
                          <span className="text-[11px] text-muted-foreground">
                            Verified Creator
                          </span>
                        </div>
                      </div>

                      {creator.bio && (
                        <p className="text-xs text-muted-foreground pt-2.5 line-clamp-2">
                          {creator.bio}
                        </p>
                      )}
                    </CardHeader>

                    <CardContent className="p-4 pt-2">
                      <div className="pt-2.5 border-t border-border flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {creator.instagram_url && (
                            <a
                              href={creator.instagram_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="Instagram"
                              title="Instagram"
                              className="h-7 w-7 rounded-lg bg-card border border-border hover:border-pink-500/50 hover:scale-105 flex items-center justify-center transition-all shadow-2xs"
                            >
                              <InstagramLogo className="h-4 w-4" />
                            </a>
                          )}
                          {creator.tiktok_url && (
                            <a
                              href={creator.tiktok_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="TikTok"
                              title="TikTok"
                              className="h-7 w-7 rounded-lg bg-card border border-border hover:border-zinc-500/50 hover:scale-105 flex items-center justify-center transition-all shadow-2xs"
                            >
                              <TikTokLogo className="h-4 w-4" />
                            </a>
                          )}
                          {creator.youtube_url && (
                            <a
                              href={creator.youtube_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="YouTube"
                              title="YouTube"
                              className="h-7 w-7 rounded-lg bg-card border border-border hover:border-red-500/50 hover:scale-105 flex items-center justify-center transition-all shadow-2xs"
                            >
                              <YouTubeLogo className="h-4 w-4" />
                            </a>
                          )}
                        </div>

                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-[#FC801A]" />
                          Open to Collabs
                        </span>
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
