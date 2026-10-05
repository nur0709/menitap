import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AuthModalButtons } from "@/features/auth/components/auth-modal-buttons";
import { getEffectiveUserContext } from "@/features/auth/actions";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function LandingPage() {
  const { user } = await getEffectiveUserContext();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-[#FC801A]/30 selection:text-foreground">
      <SiteHeader currentPath="/" />

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

            {/* Center Auth / Action Buttons */}
            <div className="mt-8 sm:mt-10 flex items-center justify-center gap-3">
              {!user ? (
                <div className="p-1 rounded-2xl bg-card border border-border shadow-xs inline-flex items-center gap-2">
                  <AuthModalButtons className="gap-2 sm:gap-3" />
                </div>
              ) : (
                <Link
                  href="/for-shoppers"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "bg-[#FC801A] hover:bg-[#E66F0D] text-white font-semibold text-sm sm:text-base px-7 h-11 rounded-xl shadow-xs border-0"
                  )}
                >
                  Explore Deals
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
