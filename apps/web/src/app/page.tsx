import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrandBorder } from "@/components/brand-border";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Check, Star, ArrowRight, Video, Link as LinkIcon, Building2, Coins, ShieldCheck, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-[#FC801A]/30 selection:text-foreground">
      {/* Decorative Top Border Ribbon */}
      <BrandBorder position="top" height="h-7 sm:h-9 md:h-11" />

      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md transition-colors">
        <div className="container mx-auto flex h-18 sm:h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
          <BrandLogo size="md" />
          
          <nav className="hidden gap-6 md:flex">
            <Link href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Pricing
            </Link>
            <Link href="#faq" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              FAQ
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
                "bg-[#FC801A] hover:bg-[#E66F0D] text-white shadow-sm transition-all"
              )}
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-28 sm:pt-28 sm:pb-36">
          {/* Subtle Ambient Brand Glow */}
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#08739C] to-[#FC801A] opacity-15 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight sm:text-7xl">
              Your Gateway to{" "}
              <span className="bg-gradient-to-r from-[#08739C] via-[#0284C7] to-[#FC801A] bg-clip-text text-transparent">
                UGC Success
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Whether you&apos;re a creator looking to collaborate with brands or a shopper hunting for the best deals — Menitap connects you to opportunities that matter.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-4 sm:gap-x-6 flex-wrap gap-y-3">
              <Link 
                href="#pricing" 
                className={cn(
                  buttonVariants({ size: "lg" }), 
                  "bg-gradient-to-r from-[#08739C] to-[#FC801A] hover:opacity-95 text-white border-0 shadow-lg shadow-[#08739C]/20"
                )}
              >
                Start Creating <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link 
                href="#features" 
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }), 
                  "border-border text-foreground hover:bg-accent"
                )}
              >
                Browse Deals
              </Link>
            </div>
            
            <div className="mt-16 flex justify-center gap-3 sm:gap-6 flex-wrap">
              <Badge variant="secondary" className="px-4 py-2 text-sm rounded-full border border-border/80 shadow-sm">
                <Building2 className="mr-2 h-4 w-4 text-[#08739C] dark:text-[#38BDF8]" /> 500+ Brands
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm rounded-full border border-border/80 shadow-sm">
                <Star className="mr-2 h-4 w-4 text-[#FC801A]" /> 10K+ Creators
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm rounded-full border border-border/80 shadow-sm">
                <Coins className="mr-2 h-4 w-4 text-[#0284C7] dark:text-[#7DD3FC]" /> 50K+ Products
              </Badge>
            </div>
          </div>
        </section>

        {/* Video Section */}
        <section id="how-it-works" className="py-24 bg-muted/30 border-y border-border/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">See How It Works</h2>
              <p className="text-lg text-muted-foreground">
                Watch our quick guide to getting started with Menitap
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl ring-1 ring-border bg-card">
                <iframe 
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                  title="YouTube video player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                🌍 YouTube auto-translates captions — click CC to watch in your language
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Everything You Need</h2>
              <p className="text-lg text-muted-foreground">
                A complete suite of tools to help you succeed as a creator or find the best deals.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <Card className="bg-card border-border hover:border-[#08739C]/50 transition-all hover:shadow-md">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-[#08739C]/10 dark:bg-[#08739C]/20 flex items-center justify-center mb-4 text-[#08739C] dark:text-[#38BDF8]">
                    <Video className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-foreground">Learn UGC</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Free educational videos to kickstart your content creation journey</p>
                </CardContent>
              </Card>

              {/* Feature 2 */}
              <Card className="bg-card border-border hover:border-[#FC801A]/50 transition-all hover:shadow-md">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-[#FC801A]/10 dark:bg-[#FC801A]/20 flex items-center justify-center mb-4 text-[#FC801A]">
                    <LinkIcon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-foreground">Affiliate Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Share and discover products with exclusive discount links</p>
                </CardContent>
              </Card>

              {/* Feature 3 */}
              <Card className="bg-card border-border hover:border-[#08739C]/50 transition-all hover:shadow-md">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-[#08739C]/10 dark:bg-[#08739C]/20 flex items-center justify-center mb-4 text-[#08739C] dark:text-[#38BDF8]">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-foreground">Brand Partnerships</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Connect with brands looking for UGC creators</p>
                </CardContent>
              </Card>

              {/* Feature 4 */}
              <Card className="bg-card border-border hover:border-[#FC801A]/50 transition-all hover:shadow-md">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-[#FC801A]/10 dark:bg-[#FC801A]/20 flex items-center justify-center mb-4 text-[#FC801A]">
                    <Coins className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-foreground">Earn Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Contribute brand links and earn points redeemable for subscription discounts</p>
                </CardContent>
              </Card>

              {/* Feature 5 */}
              <Card className="bg-card border-border hover:border-[#08739C]/50 transition-all hover:shadow-md">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-[#08739C]/10 dark:bg-[#08739C]/20 flex items-center justify-center mb-4 text-[#08739C] dark:text-[#38BDF8]">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-foreground">Curated Quality</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Every link and brand is reviewed before going live</p>
                </CardContent>
              </Card>

              {/* Feature 6 */}
              <Card className="bg-card border-border hover:border-[#FC801A]/50 transition-all hover:shadow-md">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-[#FC801A]/10 dark:bg-[#FC801A]/20 flex items-center justify-center mb-4 text-[#FC801A]">
                    <LayoutDashboard className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-foreground">Creator Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Track your links, points, and brand applications in one place</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-muted/30 border-y border-border/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Simple, Transparent Pricing</h2>
              <p className="text-lg text-muted-foreground">
                Choose the plan that fits your goals. Upgrade anytime.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
              {/* Buyer-User */}
              <Card className="bg-card border-border flex flex-col h-full shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground">Buyer-User</CardTitle>
                  <div className="mt-4 flex items-baseline text-5xl font-extrabold text-foreground">
                    Free
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-4 text-sm text-muted-foreground">
                    <li className="flex gap-x-3"><Check className="h-5 w-5 text-[#08739C] dark:text-[#38BDF8] shrink-0" /> Watch educational videos</li>
                    <li className="flex gap-x-3"><Check className="h-5 w-5 text-[#08739C] dark:text-[#38BDF8] shrink-0" /> Browse affiliate links</li>
                    <li className="flex gap-x-3"><Check className="h-5 w-5 text-[#08739C] dark:text-[#38BDF8] shrink-0" /> Discover discounted products</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/sign-up" className={cn(buttonVariants({ variant: "outline" }), "w-full border-border hover:bg-accent")}>
                    Get Started Free
                  </Link>
                </CardFooter>
              </Card>

              {/* Basic Plan */}
              <Card className="bg-card border-[#FC801A] shadow-xl shadow-[#FC801A]/10 relative flex flex-col h-full md:scale-105 z-10 ring-2 ring-[#FC801A]/40">
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <Badge className="bg-[#FC801A] text-white border-0 uppercase tracking-wider text-xs font-bold px-3 py-1 shadow-sm">
                    Most Popular
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl text-foreground">Basic Plan</CardTitle>
                  <div className="mt-4 flex items-baseline text-5xl font-extrabold text-foreground">
                    $5<span className="text-xl font-medium text-muted-foreground">/mo</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-4 text-sm text-muted-foreground">
                    <li className="flex gap-x-3"><Check className="h-5 w-5 text-[#FC801A] shrink-0" /> Everything in Free</li>
                    <li className="flex gap-x-3"><Check className="h-5 w-5 text-[#FC801A] shrink-0" /> Publish your own affiliate links</li>
                    <li className="flex gap-x-3"><Check className="h-5 w-5 text-[#FC801A] shrink-0" /> Contribute brand links</li>
                    <li className="flex gap-x-3"><Check className="h-5 w-5 text-[#FC801A] shrink-0" /> Earn redeemable points</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link 
                    href="/sign-up" 
                    className={cn(
                      buttonVariants(), 
                      "w-full bg-[#FC801A] hover:bg-[#E66F0D] text-white border-0 shadow-md shadow-[#FC801A]/20"
                    )}
                  >
                    Start Basic Plan
                  </Link>
                </CardFooter>
              </Card>

              {/* Standard Plan */}
              <Card className="bg-card border-border flex flex-col h-full shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground">Standard Plan</CardTitle>
                  <div className="mt-4 flex items-baseline text-5xl font-extrabold text-foreground">
                    $10<span className="text-xl font-medium text-muted-foreground">/mo</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-4 text-sm text-muted-foreground">
                    <li className="flex gap-x-3"><Check className="h-5 w-5 text-[#08739C] dark:text-[#38BDF8] shrink-0" /> Everything in Basic</li>
                    <li className="flex gap-x-3"><Check className="h-5 w-5 text-[#08739C] dark:text-[#38BDF8] shrink-0" /> Access brand application links</li>
                    <li className="flex gap-x-3"><Check className="h-5 w-5 text-[#08739C] dark:text-[#38BDF8] shrink-0" /> Receive products for UGC videos</li>
                    <li className="flex gap-x-3"><Check className="h-5 w-5 text-[#08739C] dark:text-[#38BDF8] shrink-0" /> Priority brand matching</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/sign-up" className={cn(buttonVariants({ variant: "outline" }), "w-full border-border hover:bg-accent")}>
                    Start Standard Plan
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Frequently Asked Questions</h2>
            </div>
            
            <div className="space-y-4">
              <details className="group rounded-lg border border-border bg-card p-6 [&_summary::-webkit-details-marker]:hidden shadow-sm">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 font-medium text-foreground">
                  <h3 className="text-lg">What is UGC?</h3>
                  <span className="relative h-5 w-5 shrink-0 text-muted-foreground">
                    <svg className="absolute inset-0 h-5 w-5 opacity-100 group-open:opacity-0 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <svg className="absolute inset-0 h-5 w-5 opacity-0 group-open:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  User-Generated Content (UGC) refers to content created by everyday people rather than professional studios. Brands love UGC because it feels authentic and relatable.
                </p>
              </details>

              <details className="group rounded-lg border border-border bg-card p-6 [&_summary::-webkit-details-marker]:hidden shadow-sm">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 font-medium text-foreground">
                  <h3 className="text-lg">Do I need experience to create UGC?</h3>
                  <span className="relative h-5 w-5 shrink-0 text-muted-foreground">
                    <svg className="absolute inset-0 h-5 w-5 opacity-100 group-open:opacity-0 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <svg className="absolute inset-0 h-5 w-5 opacity-0 group-open:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  Not at all! Menitap provides free educational videos to help you learn the basics. Many successful creators started with zero experience.
                </p>
              </details>

              <details className="group rounded-lg border border-border bg-card p-6 [&_summary::-webkit-details-marker]:hidden shadow-sm">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 font-medium text-foreground">
                  <h3 className="text-lg">How do affiliate links work?</h3>
                  <span className="relative h-5 w-5 shrink-0 text-muted-foreground">
                    <svg className="absolute inset-0 h-5 w-5 opacity-100 group-open:opacity-0 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <svg className="absolute inset-0 h-5 w-5 opacity-0 group-open:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  When you share an affiliate link and someone makes a purchase through it, you earn a commission. Menitap curates the best deals so shoppers get real discounts.
                </p>
              </details>

              <details className="group rounded-lg border border-border bg-card p-6 [&_summary::-webkit-details-marker]:hidden shadow-sm">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 font-medium text-foreground">
                  <h3 className="text-lg">What are points and how do I earn them?</h3>
                  <span className="relative h-5 w-5 shrink-0 text-muted-foreground">
                    <svg className="absolute inset-0 h-5 w-5 opacity-100 group-open:opacity-0 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <svg className="absolute inset-0 h-5 w-5 opacity-0 group-open:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  Basic and Standard members earn points by contributing brand links to the platform. Points can be redeemed for discounts on your subscription.
                </p>
              </details>

              <details className="group rounded-lg border border-border bg-card p-6 [&_summary::-webkit-details-marker]:hidden shadow-sm">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 font-medium text-foreground">
                  <h3 className="text-lg">Can I cancel my subscription?</h3>
                  <span className="relative h-5 w-5 shrink-0 text-muted-foreground">
                    <svg className="absolute inset-0 h-5 w-5 opacity-100 group-open:opacity-0 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <svg className="absolute inset-0 h-5 w-5 opacity-0 group-open:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  Yes, you can cancel anytime. You&apos;ll continue to have access until the end of your billing period.
                </p>
              </details>
            </div>
          </div>
        </section>

        {/* CTA Banner Section */}
        <section className="relative overflow-hidden py-24">
          <div className="absolute inset-0 bg-gradient-to-r from-[#08739C] via-[#02658E] to-[#FC801A] opacity-95"></div>
          <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Ready to Start Your UGC Journey?</h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
              Join thousands of creators and shoppers already on the platform.
            </p>
            <Link 
              href="/sign-up" 
              className={cn(
                buttonVariants({ size: "lg" }), 
                "bg-white text-[#08739C] hover:bg-zinc-100 font-bold text-lg px-8 h-14 inline-flex items-center justify-center shadow-lg"
              )}
            >
              Create Free Account
            </Link>
          </div>
        </section>
      </main>

      {/* Decorative Bottom Border Ribbon */}
      <BrandBorder position="bottom" height="h-7 sm:h-9 md:h-11" />

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 transition-colors">
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
