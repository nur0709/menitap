import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Check, Sparkles, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Plans & Pricing | Menitap",
  description: "Transparent pricing for shoppers, UGC creators, and company brand managers.",
};

export default function PlansPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-[#FC801A]/30 selection:text-foreground">
      <SiteHeader currentPath="/plans" />

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
                <Badge variant="outline" className="w-fit text-xs font-semibold mb-2 bg-[#08739C]/10 text-[#08739C] dark:text-[#38BDF8] border-[#08739C]/30">
                  Shopper & UGC starter
                </Badge>
                <CardTitle className="text-lg text-foreground">Explorer</CardTitle>
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
                  href="/sign-up?role=USER" 
                  className={cn(buttonVariants({ variant: "outline" }), "w-full border-border hover:bg-accent font-medium")}
                >
                  Start Free
                </Link>
              </CardFooter>
            </Card>

            {/* Basic Creator Tier */}
            <Card className="bg-card border-border flex flex-col h-full shadow-sm hover:border-[#08739C]/40 transition-colors">
              <CardHeader>
                <Badge variant="outline" className="w-fit text-xs font-semibold mb-2 bg-[#FC801A]/10 text-[#FC801A] border-[#FC801A]/30">
                  Creator Basic
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
                    <span>Everything in Explorer</span>
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
                  href="/sign-up?role=CREATOR" 
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
                  Creator Standard
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
                  href="/sign-up?role=CREATOR" 
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
                  Brand
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
                  href="/sign-up?role=BRAND" 
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

      <SiteFooter />
    </div>
  );
}
