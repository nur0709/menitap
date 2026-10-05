import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Check, Sparkles } from "lucide-react";
import { PlanCtaButton, type PlanId } from "./plan-cta-button";
import { getEffectiveUserContext } from "@/features/auth/actions";

export const metadata = {
  title: "Plans & Pricing | Menitap",
  description: "Transparent pricing for shoppers and UGC creators.",
};

export default async function PlansPage() {
  const { user, role, effectivePlan } = await getEffectiveUserContext();

  // Determine current active plan id:
  // If not logged in -> null
  // If logged in as USER -> FREE
  // If logged in as CREATOR -> BASIC or STANDARD based on subscription
  let currentPlanId: PlanId | null = null;
  if (user) {
    if (role === 'CREATOR' || role === 'ADMIN') {
      currentPlanId = (effectivePlan === 'STANDARD' ? 'STANDARD' : 'BASIC') as PlanId;
    } else {
      currentPlanId = 'FREE';
    }
  }

  // Determine dynamic CTA button text for Explorer
  const explorerButtonText = !currentPlanId
    ? "Start Free"
    : currentPlanId === "FREE"
    ? "Current Plan"
    : "Downgrade to Free";

  // Determine dynamic CTA button text for Creator Basic
  const basicButtonText = !currentPlanId
    ? "Join Basic"
    : currentPlanId === "BASIC"
    ? "Current Plan"
    : currentPlanId === "FREE"
    ? "Switch to Basic ($10/mo)"
    : "Downgrade to Basic ($10/mo)";

  // Determine dynamic CTA button text for Creator Standard
  const standardButtonText = !currentPlanId
    ? "Join Standard"
    : currentPlanId === "STANDARD"
    ? "Current Plan"
    : currentPlanId === "FREE"
    ? "Switch to Standard ($15/mo)"
    : "Upgrade to Standard ($15/mo)";

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
              Options tailored for shoppers, aspiring creators, and professional UGC creators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch max-w-5xl mx-auto">
            {/* Free Tier: Explorer */}
            <Card className="bg-card border-border flex flex-col h-full shadow-sm hover:border-[#08739C]/40 transition-colors">
              <CardHeader className="pt-6 pb-4">
                <CardTitle className="text-2xl sm:text-3xl font-extrabold text-[#08739C] dark:text-[#38BDF8] tracking-tight">
                  Explorer
                </CardTitle>
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
              <CardFooter className="pt-2">
                <PlanCtaButton
                  targetPlan="FREE"
                  userPlan={currentPlanId}
                  role="USER"
                  variant="outline"
                  className="h-11 rounded-xl border-border hover:bg-accent text-foreground text-sm font-semibold"
                >
                  {explorerButtonText}
                </PlanCtaButton>
              </CardFooter>
            </Card>

            {/* Basic Creator Tier */}
            <Card className="bg-card border-border flex flex-col h-full shadow-sm hover:border-[#FC801A]/40 transition-colors">
              <CardHeader className="pt-6 pb-4">
                <CardTitle className="text-2xl sm:text-3xl font-extrabold text-[#FC801A] tracking-tight">
                  Creator Basic
                </CardTitle>
                <div className="mt-2 flex items-baseline text-3xl font-extrabold text-foreground">
                  $10<span className="text-xs font-normal text-muted-foreground">/mo</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">For active UGC creators starting out</p>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3 text-xs sm:text-sm text-muted-foreground">
                  <li className="flex gap-2 font-medium text-foreground">
                    <Check className="h-4 w-4 text-[#FC801A] shrink-0 mt-0.5" />
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
              <CardFooter className="pt-2">
                <PlanCtaButton
                  targetPlan="BASIC"
                  userPlan={currentPlanId}
                  role="CREATOR"
                  variant="outline"
                  className="h-11 rounded-xl border border-[#FC801A] text-[#FC801A] hover:bg-[#FC801A]/10 text-sm font-semibold"
                >
                  {basicButtonText}
                </PlanCtaButton>
              </CardFooter>
            </Card>

            {/* Standard Creator Tier (Featured) */}
            <Card className="bg-card border-[#FC801A] shadow-md flex flex-col h-full ring-2 ring-[#FC801A]/30">
              <CardHeader className="pt-6 pb-4">
                <CardTitle className="text-2xl sm:text-3xl font-extrabold text-[#FC801A] tracking-tight">
                  Creator Standard
                </CardTitle>
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
              <CardFooter className="pt-2">
                <PlanCtaButton
                  targetPlan="STANDARD"
                  userPlan={currentPlanId}
                  role="CREATOR"
                  className="h-11 rounded-xl bg-[#FC801A] hover:bg-[#E66F0D] text-white border-0 shadow-sm text-sm font-semibold"
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
