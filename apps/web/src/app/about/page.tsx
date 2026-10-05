import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Check, ShoppingBag, Video, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getEffectiveUserContext } from "@/features/auth/actions";
import { BecomeCreatorCta } from "./become-creator-cta";

export const metadata = {
  title: "About | Menitap",
  description: "Learn how Menitap connects shoppers and UGC creators in The Complete UGC Ecosystem.",
};

export default async function AboutPage() {
  const { user, role } = await getEffectiveUserContext();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-[#FC801A]/30 selection:text-foreground">
      <SiteHeader currentPath="/about" />

      <main className="flex-1 py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
              The Complete UGC Ecosystem
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground">
              Connecting shoppers and creators in a transparent, direct collaboration network.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {/* Pillar 1: Shoppers */}
            <Card id="shoppers" className="bg-card border-border shadow-sm flex flex-col h-full hover:border-[#08739C]/40 transition-colors scroll-mt-24">
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
                  href="/deals" 
                  className="text-sm font-semibold text-[#08739C] dark:text-[#38BDF8] hover:underline inline-flex items-center gap-1.5"
                >
                  Start Shopping <ArrowRight className="h-3.5 w-3.5" />
                </Link>

              </CardFooter>
            </Card>

            {/* Pillar 2: UGC Creators */}
            <Card id="creators" className="bg-card border-[#FC801A]/40 shadow-sm flex flex-col h-full ring-1 ring-[#FC801A]/20 scroll-mt-24">
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
                <BecomeCreatorCta isAuthenticated={Boolean(user)} role={role} />
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

      <SiteFooter />
    </div>
  );
}
