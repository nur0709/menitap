import Link from "next/link";
import { getPublicCreators } from "@/features/links/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrandBorder } from "@/components/brand-border";
import { BrandLogo } from "@/components/brand-logo";
import { AuthNav } from "@/components/auth-nav";
import { MainNav } from "@/components/main-nav";
import { UserAvatar } from "@/components/user-avatar";
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
                              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                              </svg>
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
                              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.84-4.49V8.75a8.16 8.16 0 0 0 4.93 1.64V6.93a4.85 4.85 0 0 1-1-.24z"/>
                              </svg>
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
                              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                              </svg>
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
