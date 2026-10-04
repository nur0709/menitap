import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrandBorder } from "@/components/brand-border";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Check, Video, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "For Creators | Menitap",
  description: "Receive free products to review, build your UGC portfolio, and earn with affiliate deals.",
};

export default function ForCreatorsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-[#FC801A]/30 selection:text-foreground">
      {/* Decorative Top Border Ribbon */}
      <BrandBorder position="top" height="h-7 sm:h-9" />

      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md transition-colors">
        <div className="container mx-auto flex h-18 sm:h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
          <BrandLogo size="md" />
          
          <nav className="hidden items-center gap-1.5 md:flex">
            <Link 
              href="/for-shoppers" 
              className={cn(
                buttonVariants({ size: "sm" }), 
                "bg-[#08739C] hover:bg-[#02547A] text-white shadow-sm font-medium text-xs sm:text-sm px-3.5 h-9 border-0"
              )}
            >
              For Shoppers
            </Link>
            <Link 
              href="/for-creators" 
              className={cn(
                buttonVariants({ size: "sm" }), 
                "bg-[#08739C] hover:bg-[#02547A] text-white shadow-sm font-medium text-xs sm:text-sm px-3.5 h-9 border-0 ring-2 ring-[#08739C]/40"
              )}
            >
              For Creators
            </Link>
            <Link 
              href="/for-brands" 
              className={cn(
                buttonVariants({ size: "sm" }), 
                "bg-[#08739C] hover:bg-[#02547A] text-white shadow-sm font-medium text-xs sm:text-sm px-3.5 h-9 border-0"
              )}
            >
              For Brands
            </Link>
            <Link 
              href="/plans" 
              className={cn(
                buttonVariants({ size: "sm" }), 
                "bg-[#08739C] hover:bg-[#02547A] text-white shadow-sm font-medium text-xs sm:text-sm px-3.5 h-9 border-0"
              )}
            >
              Plans
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link 
              href="/sign-in" 
              className={cn(
                buttonVariants(), 
                "bg-[#FC801A] hover:bg-[#E66F0D] text-white shadow-sm font-medium transition-all px-4 sm:px-5"
              )}
            >
              Sign In
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge className="bg-[#FC801A] text-white border-0 text-xs font-semibold mb-3">
              Zero Follower Requirements
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground">
              For Creators
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground">
              Review products, build a verified portfolio, and collaborate directly with brands.
            </p>
          </div>

          <Card className="bg-card border-[#FC801A]/40 shadow-sm max-w-2xl mx-auto ring-1 ring-[#FC801A]/20">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-[#FC801A]/10 flex items-center justify-center text-[#FC801A] mb-4">
                <Video className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl text-foreground">Review Products & Build a Portfolio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Start creating with free beginner guides, receive brand products to test and keep in exchange for video reviews.
              </p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2.5">
                  <Check className="h-4 w-4 text-[#FC801A] shrink-0 mt-0.5" />
                  <span>Receive products to test & keep for video reviews</span>
                </li>
                <li className="flex gap-2.5">
                  <Check className="h-4 w-4 text-[#FC801A] shrink-0 mt-0.5" />
                  <span>Free beginner video lessons on filming & pitching</span>
                </li>
                <li className="flex gap-2.5">
                  <Check className="h-4 w-4 text-[#FC801A] shrink-0 mt-0.5" />
                  <span>Share affiliate links to monetize your audience</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="pt-4 border-t border-[#FC801A]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link 
                href="/plans" 
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full sm:w-auto bg-[#FC801A] hover:bg-[#E66F0D] text-white font-medium"
                )}
              >
                Join as Creator <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="/plans" className="text-xs text-muted-foreground hover:text-foreground">
                View Creator plans ($10 - $15/mo) &rarr;
              </Link>
            </CardFooter>
          </Card>
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
