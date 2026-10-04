import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrandBorder } from "@/components/brand-border";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Check, Sparkles, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Plans & Pricing | Menitap",
  description: "Transparent pricing for shoppers, UGC creators, and company brand managers.",
};

export default function PlansPage() {
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
              href="/about#shoppers" 
              className={cn(
                buttonVariants({ size: "sm" }), 
                "bg-[#08739C] hover:bg-[#02547A] text-white shadow-sm font-medium text-xs sm:text-sm px-3.5 h-9 border-0"
              )}
            >
              For Shoppers
            </Link>
            <Link 
              href="/about#creators" 
              className={cn(
                buttonVariants({ size: "sm" }), 
                "bg-[#08739C] hover:bg-[#02547A] text-white shadow-sm font-medium text-xs sm:text-sm px-3.5 h-9 border-0"
              )}
            >
              For Creators
            </Link>
            <Link 
              href="/about#brands" 
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
            <Link 
              href="/about" 
              className={cn(
                buttonVariants({ size: "sm" }), 
                "bg-[#08739C] hover:bg-[#02547A] text-white shadow-sm font-medium text-xs sm:text-sm px-3.5 h-9 border-0"
              )}
            >
              About
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link 
              href="/sign-in" 
              className={cn(
                buttonVariants(), 
                "bg-[#FC801A] hover:bg-[#E66F0D] text-white shadow-sm font-medium transition-all px-4 sm:px-5"
              )}
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
              Simple, Transparent Plans
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground">
              Options tailored for shoppers, aspiring creators, professional creators, and brand managers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {/* Free Tier */}
            <Card className="bg-card border-border flex flex-col h-full shadow-sm hover:border-[#08739C]/40 transition-colors">
              <CardHeader>
                <Badge variant="secondary" className="w-fit text-xs font-semibold mb-2">
                  Shoppers & Learners
                </Badge>
                <CardTitle className="text-lg text-foreground">Free</CardTitle>
                <div className="mt-2 flex items-baseline text-3xl font-extrabold text-foreground">
                  $0
                </div>
                <p className="text-xs text-muted-foreground mt-1">For deal hunters and beginner creators</p>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3 text-xs sm:text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                    <span>Browse all creator affiliate deals</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                    <span>Watch free beginner UGC tutorials</span>
                  </li>
                  <li className="flex gap-2">
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
            <Card className="bg-card border-border flex flex-col h-full shadow-sm hover:border-[#08739C]/40 transition-colors">
              <CardHeader>
                <Badge variant="secondary" className="w-fit text-xs font-semibold mb-2">
                  UGC Creators
                </Badge>
                <CardTitle className="text-lg text-foreground">Creator Basic</CardTitle>
                <div className="mt-2 flex items-baseline text-3xl font-extrabold text-foreground">
                  $10<span className="text-xs font-normal text-muted-foreground">/mo</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">For active UGC creators starting out</p>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3 text-xs sm:text-sm text-muted-foreground">
                  <li className="flex gap-2 font-medium text-foreground">
                    <Check className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                    <span>Everything in Free</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                    <span>Access direct brand application links</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                    <span>Receive products to test & keep for reviews</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                    <span>Publish affiliate links to shoppers</span>
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
              <div className="absolute -top-3 left-0 right-0 flex justify-center">
                <Badge className="bg-[#FC801A] text-white border-0 text-[10px] font-bold px-2.5 py-0.5 shadow-sm">
                  Recommended
                </Badge>
              </div>
              <CardHeader>
                <Badge className="w-fit text-xs font-semibold bg-[#FC801A] text-white border-0 mb-2">
                  Pro Creators
                </Badge>
                <CardTitle className="text-lg text-foreground">Creator Standard</CardTitle>
                <div className="mt-2 flex items-baseline text-3xl font-extrabold text-foreground">
                  $15<span className="text-xs font-normal text-muted-foreground">/mo</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Get discovered and hired by companies</p>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3 text-xs sm:text-sm text-muted-foreground">
                  <li className="flex gap-2 font-medium text-foreground">
                    <Check className="h-4 w-4 text-[#FC801A] shrink-0 mt-0.5" />
                    <span>Everything in Basic</span>
                  </li>
                  <li className="flex gap-2">
                    <Sparkles className="h-4 w-4 text-[#FC801A] shrink-0 mt-0.5" />
                    <span className="font-medium text-foreground">Public Creator Profile & Portfolio</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 text-[#FC801A] shrink-0 mt-0.5" />
                    <span>Category-filtered visibility to brand managers</span>
                  </li>
                  <li className="flex gap-2">
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

            {/* Brand or Agency Tier */}
            <Card className="bg-card border-[#08739C]/40 flex flex-col h-full shadow-sm hover:border-[#08739C] transition-colors ring-1 ring-[#08739C]/20">
              <CardHeader>
                <Badge className="w-fit text-xs font-semibold bg-[#08739C] text-white border-0 mb-2">
                  Brand or Agency
                </Badge>
                <CardTitle className="text-lg text-foreground">Brand Manager</CardTitle>
                <div className="mt-2 flex items-baseline text-3xl font-extrabold text-[#08739C] dark:text-[#38BDF8]">
                  Free
                </div>
                <p className="text-xs text-muted-foreground mt-1">For brands, agencies & e-commerce</p>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3 text-xs sm:text-sm text-muted-foreground">
                  <li className="flex gap-2 font-medium text-foreground">
                    <Building2 className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                    <span>Direct brand collaboration tools</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                    <span>Post product-for-review campaigns</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                    <span>Search & discover creators by category</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                    <span>Receive direct creator applications</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                    <span>Zero agency commissions or hidden fees</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link 
                  href="/sign-up" 
                  className={cn(
                    buttonVariants(), 
                    "w-full bg-[#08739C] hover:bg-[#02547A] text-white font-medium border-0"
                  )}
                >
                  Join as Brand
                </Link>
              </CardFooter>
            </Card>
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
