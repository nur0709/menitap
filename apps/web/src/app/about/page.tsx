import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrandBorder } from "@/components/brand-border";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Check, ShoppingBag, Video, Building2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "About | Menitap",
  description: "Learn how Menitap connects shoppers, UGC creators, and brands in The Complete UGC Ecosystem.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-[#FC801A]/30 selection:text-foreground">
      {/* Decorative Top Border Ribbon */}
      <BrandBorder position="top" height="h-7 sm:h-9" />

      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md transition-colors">
        <div className="container mx-auto flex h-18 sm:h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
          <BrandLogo size="md" />
          
          <nav className="hidden gap-6 md:flex">
            <Link href="/about" className="text-sm font-semibold text-foreground transition-colors">
              About
            </Link>
            <Link href="/plans" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Plans
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

      <main className="flex-1 py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
              The Complete UGC Ecosystem
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground">
              Connecting shoppers, creators, and brands in a transparent, direct collaboration network.
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
                    <span>Save favorite deals and promo codes for later</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="pt-2 border-t border-border/50">
                <Link 
                  href="/sign-up" 
                  className="text-sm font-semibold text-[#08739C] dark:text-[#38BDF8] hover:underline inline-flex items-center gap-1.5"
                >
                  Start Shopping <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </CardFooter>
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
                <CardTitle className="text-xl text-foreground">Review Products & Build a Portfolio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 flex-1">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Start creating with free beginner guides, receive brand products to test and keep in exchange for video reviews.
                </p>
                <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 text-[#FC801A] shrink-0 mt-0.5" />
                    <span>Receive products to test & keep for video reviews</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 text-[#FC801A] shrink-0 mt-0.5" />
                    <span>Free beginner video lessons on filming & pitching</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 text-[#FC801A] shrink-0 mt-0.5" />
                    <span>Share affiliate links to monetize your audience</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="pt-2 border-t border-[#FC801A]/20">
                <Link 
                  href="/sign-up" 
                  className="text-sm font-semibold text-[#FC801A] hover:underline inline-flex items-center gap-1.5"
                >
                  Become a Creator <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </CardFooter>
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
                <CardTitle className="text-xl text-foreground">Post Campaigns & Hire Directly</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 flex-1">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Connect directly with real creators. Post product-for-review campaigns to generate authentic video content.
                </p>
                <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                    <span>Post product-for-review campaigns at zero cost</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                    <span>Discover creators filtered by category</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                    <span>Hire creators directly—zero agency fees or middlemen</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="pt-2 border-t border-border/50">
                <Link 
                  href="/sign-up" 
                  className="text-sm font-semibold text-[#08739C] dark:text-[#38BDF8] hover:underline inline-flex items-center gap-1.5"
                >
                  Post a Campaign <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </CardFooter>
            </Card>
          </div>

          <div className="mt-16 text-center">
            <Link 
              href="/plans" 
              className={cn(
                buttonVariants({ size: "lg" }), 
                "bg-[#FC801A] hover:bg-[#E66F0D] text-white font-semibold text-base px-8 h-12 shadow-sm border-0"
              )}
            >
              Explore Plans
            </Link>
          </div>
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
