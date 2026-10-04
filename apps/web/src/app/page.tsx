import Link from "next/link";
import { BrandBorder } from "@/components/brand-border";
import { BrandLogo } from "@/components/brand-logo";
import { AuthNav } from "@/components/auth-nav";
import { MainNav } from "@/components/main-nav";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-[#FC801A]/30 selection:text-foreground">
      {/* Decorative Top Border Ribbon */}
      <BrandBorder position="top" height="h-7 sm:h-9" />

      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md transition-colors">
        <div className="container mx-auto flex h-18 sm:h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
          <BrandLogo size="md" />
          <MainNav currentPath="/" />
          <AuthNav />
        </div>
      </header>

      <main className="flex-1">
        {/* Video-First Hero Section */}
        <section className="pt-10 pb-16 sm:pt-14 sm:pb-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto flex flex-col items-center justify-center gap-2 sm:gap-3">
              {/* Line 1: Shoppers Save + Creators Earn */}
              <div className="flex flex-wrap items-center justify-center gap-x-2.5 sm:gap-x-3.5">
                <span>
                  <span className="text-[#08739C] dark:text-[#38BDF8]">Shoppers</span>{' '}
                  <span className="text-[#FC801A]">Save</span>
                </span>
                <span className="text-muted-foreground/70 font-semibold text-2xl sm:text-4xl lg:text-5xl">+</span>
                <span>
                  <span className="text-[#08739C] dark:text-[#38BDF8]">Creators</span>{' '}
                  <span className="text-[#FC801A]">Earn</span>
                </span>
              </div>

              {/* Line 2: = Brands Grow */}
              <div className="flex items-center justify-center gap-x-2.5 sm:gap-x-3.5">
                <span className="text-muted-foreground/70 font-semibold text-2xl sm:text-4xl lg:text-5xl">=</span>
                <span>
                  <span className="text-[#08739C] dark:text-[#38BDF8]">Brands</span>{' '}
                  <span className="text-[#FC801A]">Grow</span>
                </span>
              </div>
            </h1>

            {/* Embedded Video Centerpiece */}
            <div className="mt-8 sm:mt-12 max-w-3xl mx-auto">
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
