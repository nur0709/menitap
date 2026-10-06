import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Sparkles, ArrowRight, Video, ShoppingBag } from "lucide-react";

export const metadata = {
  title: "About | Menitap",
  description: "Real reviews. Real deals. Direct brand collaborations.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-[#FC801A]/30 selection:text-foreground">
      <SiteHeader currentPath="/about" />

      <main className="flex-1 py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Catchy Hero */}
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FC801A]/10 text-[#FC801A] text-xs font-semibold mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Authentic Shopping & UGC</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
              Where real creators meet real deals.
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
              Tired of fake 5-star reviews and expired coupons? Menitap bridges the gap between honest video reviews and verified savings.
            </p>
          </div>

          {/* How It Works - 3 Step Visual Flow */}
          <div className="mb-14">
            <div className="text-center mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">How Menitap Works</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">A simple, transparent ecosystem for everyone.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="relative p-6 rounded-2xl bg-card border border-border shadow-xs hover:border-[#08739C]/40 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-[#08739C]/10 text-[#08739C] dark:text-[#38BDF8] flex items-center justify-center font-bold text-sm mb-4">
                  01
                </div>
                <h3 className="text-base font-bold text-foreground mb-1">Brands Post Collabs</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Brands share campaigns offering free products and sponsorships to test.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative p-6 rounded-2xl bg-card border border-[#FC801A]/30 shadow-xs ring-1 ring-[#FC801A]/10 hover:border-[#FC801A] transition-colors">
                <div className="h-10 w-10 rounded-xl bg-[#FC801A]/10 text-[#FC801A] flex items-center justify-center font-bold text-sm mb-4">
                  02
                </div>
                <h3 className="text-base font-bold text-foreground mb-1">Creators Review Honestly</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Creators test products on camera and share genuine reviews alongside exclusive promo codes.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative p-6 rounded-2xl bg-card border border-border shadow-xs hover:border-[#08739C]/40 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm mb-4">
                  03
                </div>
                <h3 className="text-base font-bold text-foreground mb-1">Shoppers Save Confidently</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Shoppers see how items actually look in real life, copy verified codes, and buy with confidence.
                </p>
              </div>
            </div>
          </div>

          {/* Two Quick Action Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/deals"
              className="group p-5 rounded-xl border border-border bg-card/60 hover:bg-card hover:border-[#08739C]/40 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-[#08739C]/10 text-[#08739C] dark:text-[#38BDF8] flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground group-hover:text-[#08739C] transition-colors">For Shoppers</h4>
                  <p className="text-xs text-muted-foreground">Browse verified discount codes</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/collabs"
              className="group p-5 rounded-xl border border-border bg-card/60 hover:bg-card hover:border-[#FC801A]/50 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-[#FC801A]/10 text-[#FC801A] flex items-center justify-center">
                  <Video className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground group-hover:text-[#FC801A] transition-colors">For Creators</h4>
                  <p className="text-xs text-muted-foreground">Find brand campaigns & test products</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
