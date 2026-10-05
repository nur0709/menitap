import Link from "next/link";
import { getPublicCreators } from "@/features/links/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrandBorder } from "@/components/brand-border";
import { BrandLogo } from "@/components/brand-logo";
import { AuthNav } from "@/components/auth-nav";
import { MainNav } from "@/components/main-nav";
import { UserAvatar } from "@/components/user-avatar";
import { InstagramIcon, TikTokIcon, YouTubeIcon } from "@/components/social-icons";
import { Users, Sparkles } from "lucide-react";

export const dynamic = 'force-dynamic'

export const metadata = {
  title: "Explore Creators | Menitap",
  description: "Discover verified Creator Standard UGC creators, portfolios, and direct social media profiles.",
};

export default async function ForBrandsPage() {
  const creators = await getPublicCreators()

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-[#FC801A]/30 selection:text-foreground">
      {/* Decorative Top Border Ribbon */}
      <BrandBorder position="top" height="h-7 sm:h-9" />

      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md transition-colors">
        <div className="container mx-auto flex h-18 sm:h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
          <BrandLogo size="md" />
          <MainNav currentPath="/for-brands" />
          <AuthNav />
        </div>
      </header>

      <main className="flex-1 py-10 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-border">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs bg-[#FC801A]/10 text-[#FC801A] border-[#FC801A]/30 font-semibold">
                  Creator Standard Showcase
                </Badge>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Explore Creators
              </h1>
              <p className="mt-1 text-sm sm:text-base text-muted-foreground">
                Discover active UGC creators with verified public portfolios, social channels, and video experience.
              </p>
            </div>
          </div>

          {/* Creators Directory Grid */}
          {creators.length === 0 ? (
            <Card className="bg-card border-dashed border-border py-16 text-center">
              <CardContent className="space-y-3">
                <Users className="h-10 w-10 text-muted-foreground mx-auto" />
                <CardTitle className="text-lg text-foreground">No Public Creator Portfolios Yet</CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                  Creator Standard members who enable their public portfolio will appear here for brand discovery.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {creators.map((creator) => {
                const displayName = creator.full_name || 'UGC Creator'

                return (
                  <Card
                    key={creator.id}
                    className="bg-card border-border shadow-xs hover:border-[#FC801A]/40 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            user={{
                              fullName: creator.full_name,
                              avatarUrl: creator.avatar_url,
                            }}
                            size="md"
                          />
                          <div>
                            <CardTitle className="text-base font-bold text-foreground">
                              {displayName}
                            </CardTitle>
                            <Badge className="bg-[#FC801A]/10 text-[#FC801A] border-0 text-[10px] font-semibold mt-0.5">
                              Verified Standard
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {creator.bio && (
                        <p className="text-xs text-muted-foreground pt-3 line-clamp-3">
                          {creator.bio}
                        </p>
                      )}
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="pt-3 border-t border-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {creator.instagram_url && (
                            <a
                              href={creator.instagram_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="Instagram"
                              className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-[#FC801A] hover:bg-muted/80 transition-colors"
                            >
                              <InstagramIcon className="h-3.5 w-3.5 fill-current" />
                            </a>
                          )}
                          {creator.tiktok_url && (
                            <a
                              href={creator.tiktok_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="TikTok"
                              className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-[#FC801A] hover:bg-muted/80 transition-colors"
                            >
                              <TikTokIcon className="h-3.5 w-3.5 fill-current" />
                            </a>
                          )}
                          {creator.youtube_url && (
                            <a
                              href={creator.youtube_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="YouTube"
                              className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-[#FC801A] hover:bg-muted/80 transition-colors"
                            >
                              <YouTubeIcon className="h-3.5 w-3.5 fill-current" />
                            </a>
                          )}
                        </div>

                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-[#FC801A]" />
                          Open for Collabs
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
