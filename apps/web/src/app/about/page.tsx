import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Check, ShoppingBag, Video, ArrowRight } from "lucide-react";
import { getEffectiveUserContext } from "@/features/auth/actions";
import { BecomeCreatorCta } from "./become-creator-cta";

export const metadata = {
  title: "About | Menitap",
  description: "Learn how Menitap connects shoppers and UGC creators.",
};

export default async function AboutPage() {
  const { user, role } = await getEffectiveUserContext();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-[#FC801A]/30 selection:text-foreground">
      <SiteHeader currentPath="/about" />

      <main className="flex-1 py-10 sm:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Minimalist Title */}
          <div className="text-center max-w-xl mx-auto mb-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              About Menitap
            </h1>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground">
              Where shoppers find real discounts and UGC creators grow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
            {/* Pillar 1: Shoppers */}
            <Card id="shoppers" className="bg-card border-border shadow-xs hover:border-[#08739C]/40 transition-colors flex flex-col justify-between">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-[#08739C]/10 flex items-center justify-center text-[#08739C] dark:text-[#38BDF8]">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <Badge variant="secondary" className="text-[11px] font-semibold">
                    Shoppers • Free
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold text-foreground">
                  Save on Real Products
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Verified discount codes and honest reviews before you purchase.
                </p>
              </CardHeader>
              <CardContent className="p-5 pt-1 flex-1">
                <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                    <span>Verified discounts & promo codes</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                    <span>Authentic video reviews before buying</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                    <span>Save deals for later</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="p-5 pt-0 border-t border-border/40">
                <Link 
                  href="/deals" 
                  className="pt-3 text-xs sm:text-sm font-semibold text-[#08739C] dark:text-[#38BDF8] hover:underline inline-flex items-center gap-1.5"
                >
                  Browse Deals <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </CardFooter>
            </Card>

            {/* Pillar 2: UGC Creators */}
            <Card id="creators" className="bg-card border-[#FC801A]/40 shadow-xs ring-1 ring-[#FC801A]/20 flex flex-col justify-between">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-[#FC801A]/10 flex items-center justify-center text-[#FC801A]">
                    <Video className="h-5 w-5" />
                  </div>
                  <Badge className="bg-[#FC801A] text-white border-0 text-[11px] font-semibold">
                    UGC Creators
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold text-foreground">
                  Review Products & Earn
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Receive products to test, build a portfolio, and monetize.
                </p>
              </CardHeader>
              <CardContent className="p-5 pt-1 flex-1">
                <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 text-[#FC801A] shrink-0 mt-0.5" />
                    <span>Receive free products to keep</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 text-[#FC801A] shrink-0 mt-0.5" />
                    <span>Direct brand collaboration links</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 text-[#FC801A] shrink-0 mt-0.5" />
                    <span>Share affiliate deals & earn</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="p-5 pt-0 border-t border-[#FC801A]/20">
                <div className="pt-3">
                  <BecomeCreatorCta isAuthenticated={Boolean(user)} role={role} />
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
