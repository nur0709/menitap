import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function LandingPage() {

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-[#FC801A]/30 selection:text-foreground">
      <SiteHeader currentPath="/" />

      <main className="flex-1">
        {/* Video-First Hero Section */}
        <section className="pt-10 pb-16 sm:pt-14 sm:pb-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl">
            <h1 className="w-full text-center font-extrabold tracking-tight flex flex-col items-center justify-center gap-1.5 sm:gap-2.5 text-[clamp(1.125rem,4.8vw,3.5rem)] leading-tight select-none">
              {/* Line 1: Shoppers Save + Creators Earn */}
              <div className="flex items-center justify-center gap-x-[0.4em] whitespace-nowrap">
                <span>
                  <span className="text-[#08739C] dark:text-[#38BDF8]">Shoppers</span>{' '}
                  <span className="text-[#FC801A]">Save</span>
                </span>
                <span className="text-muted-foreground/60 font-semibold text-[0.85em]">+</span>
                <span>
                  <span className="text-[#08739C] dark:text-[#38BDF8]">Creators</span>{' '}
                  <span className="text-[#FC801A]">Earn</span>
                </span>
              </div>

              {/* Line 2: = Brands Grow */}
              <div className="flex items-center justify-center gap-x-[0.4em] whitespace-nowrap">
                <span className="text-muted-foreground/60 font-semibold text-[0.85em]">=</span>
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

      <SiteFooter />
    </div>
  );
}
