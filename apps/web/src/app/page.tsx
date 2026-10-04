import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrandBorder } from "@/components/brand-border";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  Check, 
  ArrowRight, 
  ShoppingBag, 
  Video, 
  Building2, 
  Gift, 
  Tag, 
  Sparkles 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-[#FC801A]/30 selection:text-foreground">
      {/* Decorative Top Border Ribbon */}
      <BrandBorder position="top" height="h-7 sm:h-9" />

      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md transition-colors">
        <div className="container mx-auto flex h-18 sm:h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
          <BrandLogo size="md" />
          
          <nav className="hidden gap-6 md:flex">
            <Link href="#pillars" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              How It Works
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Pricing
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link 
              href="/sign-in" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
            >
              Sign In
            </Link>
            <Link 
              href="/sign-up" 
              className={cn(
                buttonVariants(), 
                "bg-[#FC801A] hover:bg-[#E66F0D] text-white shadow-sm font-medium transition-all"
              )}
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* 1. Hero Section */}
        <section className="pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-border/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl">
            {/* Value Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border bg-muted/60 text-xs sm:text-sm font-medium text-muted-foreground mb-8">
              <Gift className="h-4 w-4 text-[#FC801A]" />
              <span>Get free products to review & keep — start creating today</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
              Discover Great Deals.{" "}
              <span className="block mt-1 sm:mt-2 text-[#08739C] dark:text-[#38BDF8]">
                Collaborate With Brands.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed">
              Shoppers save with verified creator discounts. Everyday users start their UGC journey with free products. Brands recruit authentic talent — all in one place.
            </p>

            <div className="mt-10 flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
              <Link 
                href="/sign-up" 
                className={cn(
                  buttonVariants({ size: "lg" }), 
                  "bg-[#FC801A] hover:bg-[#E66F0D] text-white font-semibold text-base px-7 h-12 shadow-sm border-0"
                )}
              >
                Browse Deals <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link 
                href="#pricing" 
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }), 
                  "border-border text-foreground hover:bg-accent font-semibold text-base px-7 h-12"
                )}
              >
                Start Creating
              </Link>
            </div>

            {/* Quick Micro Badges */}
            <div className="mt-14 flex justify-center gap-3 sm:gap-6 flex-wrap text-xs sm:text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Gift className="h-4 w-4 text-[#FC801A]" /> Free Products to Keep
              </span>
              <span className="flex items-center gap-1.5">
                <Tag className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8]" /> Verified Creator Deals
              </span>
              <span className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8]" /> Direct Brand Campaigns
              </span>
            </div>
          </div>
        </section>

        {/* 2. The 3 Pillars Section */}
        <section id="pillars" className="py-20 sm:py-24 bg-muted/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
                Built for Everyone in the Ecosystem
              </h2>
              <p className="mt-3 text-muted-foreground text-base">
                Whether you want to shop smarter, start creating content, or hire authentic creators.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {/* Pillar 1: Shoppers */}
              <Card className="bg-card border-border shadow-sm flex flex-col h-full hover:border-[#08739C]/40 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-[#08739C]/10 flex items-center justify-center text-[#08739C] dark:text-[#38BDF8] mb-4">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary" className="w-fit text-xs font-semibold mb-2">
                    For Shoppers • Free
                  </Badge>
                  <CardTitle className="text-xl text-foreground">Find Deals & Save</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Access verified discount codes and honest product reviews before you purchase.
                  </p>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
                    <li className="flex gap-2">
                      <Check className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                      <span>Verified creator discounts & promo codes</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                      <span>Watch authentic video reviews before buying</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                      <span>Save favorite deals & learning guides for later</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Pillar 2: UGC Creators */}
              <Card className="bg-card border-[#FC801A]/40 shadow-sm flex flex-col h-full ring-1 ring-[#FC801A]/20">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-[#FC801A]/10 flex items-center justify-center text-[#FC801A] mb-4">
                    <Video className="h-6 w-6" />
                  </div>
                  <Badge className="w-fit text-xs font-semibold bg-[#FC801A] text-white border-0 mb-2">
                    For UGC Creators
                  </Badge>
                  <CardTitle className="text-xl text-foreground">Get Free Products & Work</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Start creating with free beginner guides, receive products to test without paying, and monetize your links.
                  </p>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
                    <li className="flex gap-2">
                      <Check className="h-4 w-4 text-[#FC801A] shrink-0 mt-0.5" />
                      <span>Receive free gifted products to review & keep</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-4 w-4 text-[#FC801A] shrink-0 mt-0.5" />
                      <span>Free beginner video lessons on filming & pitching</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-4 w-4 text-[#FC801A] shrink-0 mt-0.5" />
                      <span>Post affiliate deals & build a public portfolio</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Pillar 3: Brands */}
              <Card className="bg-card border-border shadow-sm flex flex-col h-full hover:border-[#08739C]/40 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-[#08739C]/10 flex items-center justify-center text-[#08739C] dark:text-[#38BDF8] mb-4">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary" className="w-fit text-xs font-semibold mb-2">
                    For Brands • 100% Free
                  </Badge>
                  <CardTitle className="text-xl text-foreground">Post Campaigns & Recruit</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Connect directly with real creators. Post product gifting and video campaigns to generate authentic user reviews.
                  </p>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
                    <li className="flex gap-2">
                      <Check className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                      <span>Post collaboration & gifting links at zero cost</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                      <span>Discover creators filtered by category</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                      <span>Direct creator applications without middlemen</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* 3. Transparent Pricing Section */}
        <section id="pricing" className="py-20 sm:py-24 border-t border-border/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
                Simple, Transparent Plans
              </h2>
              <p className="mt-3 text-muted-foreground text-base">
                Browse deals and learn for free, or unlock creator tools to collaborate with brands.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {/* Free Tier */}
              <Card className="bg-card border-border flex flex-col h-full shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">Shopper & Learner</CardTitle>
                  <div className="mt-4 flex items-baseline text-4xl font-extrabold text-foreground">
                    Free
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">For deal hunters and beginner creators</p>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3.5 text-sm text-muted-foreground">
                    <li className="flex gap-2.5">
                      <Check className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                      <span>Browse all creator affiliate deals</span>
                    </li>
                    <li className="flex gap-2.5">
                      <Check className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                      <span>Watch free beginner UGC tutorials</span>
                    </li>
                    <li className="flex gap-2.5">
                      <Check className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                      <span>Save deals & guides for later</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link 
                    href="/sign-up" 
                    className={cn(buttonVariants({ variant: "outline" }), "w-full border-border hover:bg-accent font-medium")}
                  >
                    Start Free
                  </Link>
                </CardFooter>
              </Card>

              {/* Basic Creator Tier */}
              <Card className="bg-card border-border flex flex-col h-full shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">Creator Basic</CardTitle>
                  <div className="mt-4 flex items-baseline text-4xl font-extrabold text-foreground">
                    $10<span className="text-base font-normal text-muted-foreground">/mo</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">For active UGC creators starting out</p>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3.5 text-sm text-muted-foreground">
                    <li className="flex gap-2.5 font-medium text-foreground">
                      <Check className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                      <span>Everything in Free</span>
                    </li>
                    <li className="flex gap-2.5">
                      <Check className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                      <span>Access verified brand campaign links</span>
                    </li>
                    <li className="flex gap-2.5">
                      <Check className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                      <span>Apply for free gifted products to keep</span>
                    </li>
                    <li className="flex gap-2.5">
                      <Check className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                      <span>Publish your affiliate links to shoppers</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link 
                    href="/sign-up" 
                    className={cn(buttonVariants({ variant: "outline" }), "w-full border-border hover:bg-accent font-medium")}
                  >
                    Join Basic
                  </Link>
                </CardFooter>
              </Card>

              {/* Standard Creator Tier (Featured) */}
              <Card className="bg-card border-[#FC801A] shadow-md relative flex flex-col h-full ring-2 ring-[#FC801A]/30">
                <div className="absolute -top-3.5 left-0 right-0 flex justify-center">
                  <Badge className="bg-[#FC801A] text-white border-0 text-xs font-bold px-3 py-0.5 shadow-sm">
                    Recommended
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">Creator Standard</CardTitle>
                  <div className="mt-4 flex items-baseline text-4xl font-extrabold text-foreground">
                    $15<span className="text-base font-normal text-muted-foreground">/mo</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Get discovered and hired by companies</p>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3.5 text-sm text-muted-foreground">
                    <li className="flex gap-2.5 font-medium text-foreground">
                      <Check className="h-4 w-4 text-[#FC801A] shrink-0 mt-0.5" />
                      <span>Everything in Basic</span>
                    </li>
                    <li className="flex gap-2.5">
                      <Sparkles className="h-4 w-4 text-[#FC801A] shrink-0 mt-0.5" />
                      <span className="font-medium text-foreground">Public Creator Profile & Portfolio</span>
                    </li>
                    <li className="flex gap-2.5">
                      <Check className="h-4 w-4 text-[#FC801A] shrink-0 mt-0.5" />
                      <span>Category-filtered visibility to brand managers</span>
                    </li>
                    <li className="flex gap-2.5">
                      <Check className="h-4 w-4 text-[#FC801A] shrink-0 mt-0.5" />
                      <span>Showcase social media & video work</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link 
                    href="/sign-up" 
                    className={cn(
                      buttonVariants(), 
                      "w-full bg-[#FC801A] hover:bg-[#E66F0D] text-white font-semibold border-0 shadow-sm"
                    )}
                  >
                    Join Standard
                  </Link>
                </CardFooter>
              </Card>
            </div>

            {/* Brand Manager Callout */}
            <div className="mt-12 p-5 rounded-2xl bg-muted/40 border border-border text-center max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">Are you a Company or Brand Manager?</p>
                <p className="text-xs text-muted-foreground mt-0.5">Post product gifting campaigns and discover creators 100% free.</p>
              </div>
              <Link 
                href="/sign-up" 
                className={cn(buttonVariants({ size: "sm" }), "bg-[#08739C] hover:bg-[#02547A] text-white border-0 font-medium shrink-0")}
              >
                Post a Campaign Free
              </Link>
            </div>
          </div>
        </section>
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
            <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
