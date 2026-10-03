import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Play, Check, Star, ArrowRight, Video, Link as LinkIcon, Building2, Coins, ShieldCheck, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-2xl font-bold text-transparent">
              Menitap
            </span>
          </div>
          <nav className="hidden gap-6 md:flex">
            <Link href="#features" className="text-sm font-medium text-zinc-300 transition-colors hover:text-white">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-zinc-300 transition-colors hover:text-white">
              Pricing
            </Link>
            <Link href="#faq" className="text-sm font-medium text-zinc-300 transition-colors hover:text-white">
              FAQ
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors px-3 py-1.5">
              Sign In
            </Link>
            <Link href="/sign-up" className={cn(buttonVariants(), "bg-white text-black hover:bg-zinc-200")}>
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-32 sm:pt-32 sm:pb-40">
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#3b82f6] to-[#9333ea] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight sm:text-7xl">
              Your Gateway to <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">UGC Success</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
              Whether you're a creator looking to collaborate with brands or a shopper hunting for the best deals — Menitap connects you to opportunities that matter.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="#pricing" className={cn(buttonVariants({ size: "lg" }), "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0")}>Start Creating <ArrowRight className="ml-2 h-4 w-4" /></Link>
              <Link href="#features" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "border-white/20 text-white hover:bg-white/10 hover:text-white")}>Browse Deals</Link>
            </div>
            
            <div className="mt-16 flex justify-center gap-4 sm:gap-8 flex-wrap">
              <Badge variant="secondary" className="bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10 px-4 py-2 text-sm rounded-full">
                <Building2 className="mr-2 h-4 w-4 text-blue-400" /> 500+ Brands
              </Badge>
              <Badge variant="secondary" className="bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10 px-4 py-2 text-sm rounded-full">
                <Star className="mr-2 h-4 w-4 text-yellow-400" /> 10K+ Creators
              </Badge>
              <Badge variant="secondary" className="bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10 px-4 py-2 text-sm rounded-full">
                <Coins className="mr-2 h-4 w-4 text-purple-400" /> 50K+ Products
              </Badge>
            </div>
          </div>
        </section>

        {/* Video Section */}
        <section id="how-it-works" className="py-24 bg-zinc-950">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">See How It Works</h2>
              <p className="text-lg text-zinc-400">
                Watch our quick guide to getting started with Menitap
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-[0_0_50px_-12px_rgba(147,51,234,0.3)] ring-1 ring-white/10">
                <iframe 
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                  title="YouTube video player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
              <p className="mt-4 text-center text-sm text-zinc-500">
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
              <p className="text-lg text-zinc-400">
                A complete suite of tools to help you succeed as a creator or find the best deals.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <Card className="bg-zinc-900/50 border-white/10 hover:border-white/20 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4 text-blue-400">
                    <Video className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-white">Learn UGC</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-400">Free educational videos to kickstart your content creation journey</p>
                </CardContent>
              </Card>

              {/* Feature 2 */}
              <Card className="bg-zinc-900/50 border-white/10 hover:border-white/20 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4 text-purple-400">
                    <LinkIcon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-white">Affiliate Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-400">Share and discover products with exclusive discount links</p>
                </CardContent>
              </Card>

              {/* Feature 3 */}
              <Card className="bg-zinc-900/50 border-white/10 hover:border-white/20 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-white">Brand Partnerships</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-400">Connect with brands looking for UGC creators</p>
                </CardContent>
              </Card>

              {/* Feature 4 */}
              <Card className="bg-zinc-900/50 border-white/10 hover:border-white/20 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-yellow-500/20 flex items-center justify-center mb-4 text-yellow-400">
                    <Coins className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-white">Earn Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-400">Contribute brand links and earn points redeemable for subscription discounts</p>
                </CardContent>
              </Card>

              {/* Feature 5 */}
              <Card className="bg-zinc-900/50 border-white/10 hover:border-white/20 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-rose-500/20 flex items-center justify-center mb-4 text-rose-400">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-white">Curated Quality</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-400">Every link and brand is reviewed before going live</p>
                </CardContent>
              </Card>

              {/* Feature 6 */}
              <Card className="bg-zinc-900/50 border-white/10 hover:border-white/20 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-cyan-500/20 flex items-center justify-center mb-4 text-cyan-400">
                    <LayoutDashboard className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-white">Creator Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-400">Track your links, points, and brand applications in one place</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-zinc-950">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Simple, Transparent Pricing</h2>
              <p className="text-lg text-zinc-400">
                Choose the plan that fits your goals. Upgrade anytime.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
              {/* Buyer-User */}
              <Card className="bg-zinc-900/30 border-white/10 flex flex-col h-full">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Buyer-User</CardTitle>
                  <div className="mt-4 flex items-baseline text-5xl font-extrabold text-white">
                    Free
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-4 text-sm text-zinc-300">
                    <li className="flex gap-x-3"><Check className="h-5 w-5 text-purple-400 shrink-0" /> Watch educational videos</li>
                    <li className="flex gap-x-3"><Check className="h-5 w-5 text-purple-400 shrink-0" /> Browse affiliate links</li>
                    <li className="flex gap-x-3"><Check className="h-5 w-5 text-purple-400 shrink-0" /> Discover discounted products</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/sign-up" className={cn(buttonVariants(), "w-full bg-white/10 text-white hover:bg-white/20 border-0")}>
                    Get Started Free
                  </Link>
                </CardFooter>
              </Card>

              {/* Basic Plan */}
              <Card className="bg-zinc-900 border-purple-500/50 shadow-[0_0_30px_-10px_rgba(147,51,234,0.4)] relative flex flex-col h-full md:scale-105 z-10">
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 uppercase tracking-wider text-xs font-bold px-3 py-1">
                    Popular
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl text-white">Basic Plan</CardTitle>
                  <div className="mt-4 flex items-baseline text-5xl font-extrabold text-white">
                    $5<span className="text-xl font-medium text-zinc-400">/mo</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-4 text-sm text-zinc-300">
                    <li className="flex gap-x-3"><Check className="h-5 w-5 text-purple-400 shrink-0" /> Everything in Free</li>
                    <li className="flex gap-x-3"><Check className="h-5 w-5 text-purple-400 shrink-0" /> Publish your own affiliate links</li>
                    <li className="flex gap-x-3"><Check className="h-5 w-5 text-purple-400 shrink-0" /> Contribute brand links</li>
                    <li className="flex gap-x-3"><Check className="h-5 w-5 text-purple-400 shrink-0" /> Earn redeemable points</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/sign-up" className={cn(buttonVariants(), "w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0")}>
                    Start Basic Plan
                  </Link>
                </CardFooter>
              </Card>

              {/* Standard Plan */}
              <Card className="bg-zinc-900/30 border-white/10 flex flex-col h-full">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Standard Plan</CardTitle>
                  <div className="mt-4 flex items-baseline text-5xl font-extrabold text-white">
                    $10<span className="text-xl font-medium text-zinc-400">/mo</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-4 text-sm text-zinc-300">
                    <li className="flex gap-x-3"><Check className="h-5 w-5 text-purple-400 shrink-0" /> Everything in Basic</li>
                    <li className="flex gap-x-3"><Check className="h-5 w-5 text-purple-400 shrink-0" /> Access brand application links</li>
                    <li className="flex gap-x-3"><Check className="h-5 w-5 text-purple-400 shrink-0" /> Receive products for UGC videos</li>
                    <li className="flex gap-x-3"><Check className="h-5 w-5 text-purple-400 shrink-0" /> Priority brand matching</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/sign-up" className={cn(buttonVariants(), "w-full bg-white/10 text-white hover:bg-white/20 border-0")}>
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
              <details className="group rounded-lg border border-white/10 bg-zinc-900/50 p-6 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 font-medium text-white">
                  <h3 className="text-lg">What is UGC?</h3>
                  <span className="relative h-5 w-5 shrink-0">
                    <svg className="absolute inset-0 h-5 w-5 opacity-100 group-open:opacity-0 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <svg className="absolute inset-0 h-5 w-5 opacity-0 group-open:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-4 leading-relaxed text-zinc-400">
                  User-Generated Content (UGC) refers to content created by everyday people rather than professional studios. Brands love UGC because it feels authentic and relatable.
                </p>
              </details>

              <details className="group rounded-lg border border-white/10 bg-zinc-900/50 p-6 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 font-medium text-white">
                  <h3 className="text-lg">Do I need experience to create UGC?</h3>
                  <span className="relative h-5 w-5 shrink-0">
                    <svg className="absolute inset-0 h-5 w-5 opacity-100 group-open:opacity-0 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <svg className="absolute inset-0 h-5 w-5 opacity-0 group-open:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-4 leading-relaxed text-zinc-400">
                  Not at all! Menitap provides free educational videos to help you learn the basics. Many successful creators started with zero experience.
                </p>
              </details>

              <details className="group rounded-lg border border-white/10 bg-zinc-900/50 p-6 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 font-medium text-white">
                  <h3 className="text-lg">How do affiliate links work?</h3>
                  <span className="relative h-5 w-5 shrink-0">
                    <svg className="absolute inset-0 h-5 w-5 opacity-100 group-open:opacity-0 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <svg className="absolute inset-0 h-5 w-5 opacity-0 group-open:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-4 leading-relaxed text-zinc-400">
                  When you share an affiliate link and someone makes a purchase through it, you earn a commission. Menitap curates the best deals so shoppers get real discounts.
                </p>
              </details>

              <details className="group rounded-lg border border-white/10 bg-zinc-900/50 p-6 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 font-medium text-white">
                  <h3 className="text-lg">What are points and how do I earn them?</h3>
                  <span className="relative h-5 w-5 shrink-0">
                    <svg className="absolute inset-0 h-5 w-5 opacity-100 group-open:opacity-0 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <svg className="absolute inset-0 h-5 w-5 opacity-0 group-open:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-4 leading-relaxed text-zinc-400">
                  Basic and Standard members earn points by contributing brand links to the platform. Points can be redeemed for discounts on your subscription.
                </p>
              </details>

              <details className="group rounded-lg border border-white/10 bg-zinc-900/50 p-6 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 font-medium text-white">
                  <h3 className="text-lg">Can I cancel my subscription?</h3>
                  <span className="relative h-5 w-5 shrink-0">
                    <svg className="absolute inset-0 h-5 w-5 opacity-100 group-open:opacity-0 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <svg className="absolute inset-0 h-5 w-5 opacity-0 group-open:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-4 leading-relaxed text-zinc-400">
                  Yes, you can cancel anytime. You'll continue to have access until the end of your billing period.
                </p>
              </details>
            </div>
          </div>
        </section>

        {/* CTA Banner Section */}
        <section className="relative overflow-hidden py-24">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-90"></div>
          <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Ready to Start Your UGC Journey?</h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
              Join thousands of creators and shoppers already on the platform.
            </p>
            <Link href="/sign-up" className={cn(buttonVariants({ size: "lg" }), "bg-white text-purple-900 hover:bg-zinc-100 font-bold text-lg px-8 h-14 inline-flex items-center justify-center")}>
              Create Free Account
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-white/10 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Menitap
          </div>
          <p className="text-sm text-zinc-500">
            © 2026 Menitap. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-zinc-400">
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
