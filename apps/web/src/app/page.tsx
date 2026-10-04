import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { BrandBorder } from "@/components/brand-border";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

export default function LandingPage() {
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
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground px-3 py-1.5 ml-1"
            >
              Plans
            </Link>
            <Link 
              href="/about" 
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground px-3 py-1.5"
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

      <main className="flex-1">
        {/* Video-First Hero Section */}
        <section className="pt-10 pb-16 sm:pt-14 sm:pb-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl max-w-4xl mx-auto flex flex-col gap-1 sm:gap-2">
              <span className="text-[#08739C] dark:text-[#38BDF8]">
                Discover Deals.
              </span>
              <span className="text-[#FC801A]">
                Create Content.
              </span>
              <span className="text-[#08739C] dark:text-[#38BDF8]">
                Grow Your Brand.
              </span>
            </h1>

            {/* Brand or Agency Callout */}
            <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-muted/40 border border-border text-center max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="text-sm font-semibold text-foreground">Are you a Brand or Agency?</p>
                <p className="text-xs text-muted-foreground mt-0.5">Post product-for-review campaigns and discover creators 100% free.</p>
              </div>
              <Link 
                href="/sign-up" 
                className={cn(buttonVariants({ size: "sm" }), "bg-[#08739C] hover:bg-[#02547A] text-white border-0 font-medium shrink-0")}
              >
                Post a Campaign Free
              </Link>
            </div>

            {/* Embedded Video Centerpiece */}
            <div className="mt-8 sm:mt-10 max-w-3xl mx-auto">
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg border border-border bg-card">
                <iframe 
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                  title="How Menitap Works" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </section>
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
