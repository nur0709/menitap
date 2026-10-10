import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Check } from "lucide-react";
import { PlanCtaButton, type PlanId } from "./plan-cta-button";
import { getEffectiveUserContext } from "@/features/auth/actions";

export const metadata = {
  title: "Plans | Menitap",
  description: "Transparent pricing for shoppers and UGC creators.",
};

export default async function PlansPage() {
  const { user, role, effectivePlan } = await getEffectiveUserContext();

  const isBrandAccount = role === 'BRAND'
  let currentPlanId: PlanId | null = null;
  if (user && !isBrandAccount) {
    if (role === 'CREATOR' || role === 'ADMIN') {
      if (effectivePlan === 'STANDARD') {
        currentPlanId = 'STANDARD';
      } else if (effectivePlan === 'BASIC') {
        currentPlanId = 'BASIC';
      } else {
        currentPlanId = 'FREE';
      }
    } else {
      currentPlanId = 'FREE';
    }
  }

  const freeButtonText = !currentPlanId
    ? "Start Free"
    : currentPlanId === "FREE"
    ? "Current Plan"
    : "Downgrade to Free";

  const basicButtonText = !currentPlanId
    ? "Get Basic"
    : currentPlanId === "BASIC"
    ? "Current Plan"
    : currentPlanId === "FREE"
    ? "Switch to Basic"
    : "Downgrade to Basic";

  const standardButtonText = !currentPlanId
    ? "Get Standard"
    : currentPlanId === "STANDARD"
    ? "Current Plan"
    : "Upgrade to Standard";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-[#FC801A]/30 selection:text-foreground">
      <SiteHeader currentPath="/plans" />

      <main className="flex-1 py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          {/* Minimalist Title */}
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Plans
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
              Choose the plan that fits your goals. Upgrade or cancel anytime.
            </p>
            {isBrandAccount ? (
              <p className="mt-3 text-xs text-muted-foreground">
                Brand accounts are separate from these shopper and creator plans.
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
            {/* Free ($0/mo) */}
            <Card className="bg-card border-border flex flex-col h-full rounded-2xl shadow-xs hover:border-[#08739C]/40 transition-colors">
              <CardHeader className="p-5 sm:p-6 pb-4 border-b border-border/60">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border border-[#08739C]/40 text-[#08739C] dark:text-[#38BDF8] bg-[#08739C]/5">
                    Free
                  </span>
                </div>
                <div className="mt-3 flex items-baseline text-2xl sm:text-3xl font-extrabold text-foreground">
                  $0<span className="text-xs font-normal text-muted-foreground ml-1">/mo</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">For shoppers & deal hunters</p>
              </CardHeader>
              <CardContent className="p-5 sm:p-6 pt-5 flex-1">
                <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
                  <li className="flex gap-2.5">
                    <Check className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                    <span>Browse verified brand deals</span>
                  </li>
                  <li className="flex gap-2.5">
                    <Check className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                    <span>Access creator discount codes</span>
                  </li>
                  <li className="flex gap-2.5">
                    <Check className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                    <span>Save favorite deals</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="p-5 sm:p-6 pt-0">
                <PlanCtaButton
                  targetPlan="FREE"
                  userPlan={currentPlanId}
                  role="USER"
                  disabledLabel={isBrandAccount ? 'Brand account' : undefined}
                  variant="outline"
                  className="h-10 rounded-xl border-border hover:bg-accent text-foreground text-xs sm:text-sm font-semibold"
                >
                  {freeButtonText}
                </PlanCtaButton>
              </CardFooter>
            </Card>

            {/* Basic ($10/mo) */}
            <Card className="bg-card border-border flex flex-col h-full rounded-2xl shadow-xs hover:border-[#FC801A]/40 transition-colors">
              <CardHeader className="p-5 sm:p-6 pb-4 border-b border-border/60">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border border-[#FC801A]/50 text-[#FC801A] bg-[#FC801A]/5">
                    Basic
                  </span>
                </div>
                <div className="mt-3 flex items-baseline text-2xl sm:text-3xl font-extrabold text-foreground">
                  $10<span className="text-xs font-normal text-muted-foreground ml-1">/mo</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">For active UGC creators</p>
              </CardHeader>
              <CardContent className="p-5 sm:p-6 pt-5 flex-1">
                <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
                  <li className="flex gap-2.5 font-medium text-foreground">
                    <Check className="h-4 w-4 text-[#FC801A] shrink-0 mt-0.5" />
                    <span>Everything in Free</span>
                  </li>
                  <li className="flex gap-2.5">
                    <Check className="h-4 w-4 text-[#FC801A] shrink-0 mt-0.5" />
                    <span>Apply to brand collabs (gifted & paid)</span>
                  </li>
                  <li className="flex gap-2.5">
                    <Check className="h-4 w-4 text-[#FC801A] shrink-0 mt-0.5" />
                    <span>Track deals in campaign pipeline</span>
                  </li>
                  <li className="flex gap-2.5">
                    <Check className="h-4 w-4 text-[#FC801A] shrink-0 mt-0.5" />
                    <span>Share affiliate links & promo codes</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="p-5 sm:p-6 pt-0">
                <PlanCtaButton
                  targetPlan="BASIC"
                  userPlan={currentPlanId}
                  role="CREATOR"
                  disabledLabel={isBrandAccount ? 'Brand account' : undefined}
                  variant="outline"
                  className="h-10 rounded-xl border border-[#FC801A] text-[#FC801A] hover:bg-[#FC801A]/10 text-xs sm:text-sm font-semibold"
                >
                  {basicButtonText}
                </PlanCtaButton>
              </CardFooter>
            </Card>

            {/* Standard ($15/mo) */}
            <Card className="bg-card border-[#FC801A]/60 shadow-md flex flex-col h-full rounded-2xl ring-1 ring-[#FC801A]/25 hover:border-[#FC801A] transition-colors">
              <CardHeader className="p-5 sm:p-6 pb-4 border-b border-border/60">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#FC801A] text-white shadow-2xs">
                    Standard
                  </span>
                  <span className="text-[11px] font-semibold text-[#FC801A] bg-[#FC801A]/10 px-2 py-0.5 rounded-full">
                    Recommended
                  </span>
                </div>
                <div className="mt-3 flex items-baseline text-2xl sm:text-3xl font-extrabold text-foreground">
                  $15<span className="text-xs font-normal text-muted-foreground ml-1">/mo</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Public portfolio showcase</p>
              </CardHeader>
              <CardContent className="p-5 sm:p-6 pt-5 flex-1">
                <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
                  <li className="flex gap-2.5 font-medium text-foreground">
                    <Check className="h-4 w-4 text-[#FC801A] shrink-0 mt-0.5" />
                    <span>Everything in Basic</span>
                  </li>
                  <li className="flex gap-2.5">
                    <Check className="h-4 w-4 text-[#FC801A] shrink-0 mt-0.5" />
                    <span className="font-medium text-foreground">Public creator profile on Explore</span>
                  </li>
                  <li className="flex gap-2.5">
                    <Check className="h-4 w-4 text-[#FC801A] shrink-0 mt-0.5" />
                    <span>Connected social links (IG, TikTok, YT)</span>
                  </li>
                  <li className="flex gap-2.5">
                    <Check className="h-4 w-4 text-[#FC801A] shrink-0 mt-0.5" />
                    <span>Custom bio & niche for brand discovery</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="p-5 sm:p-6 pt-0">
                <PlanCtaButton
                  targetPlan="STANDARD"
                  userPlan={currentPlanId}
                  role="CREATOR"
                  disabledLabel={isBrandAccount ? 'Brand account' : undefined}
                  className="h-10 rounded-xl bg-[#FC801A] hover:bg-[#E66F0D] text-white border-0 shadow-sm text-xs sm:text-sm font-semibold"
                >
                  {standardButtonText}
                </PlanCtaButton>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
