import React from "react";
import { BrandBorder } from "@/components/brand-border";
import { BrandLogo } from "@/components/brand-logo";
import { AuthNav } from "@/components/auth-nav";
import { MainNav } from "@/components/main-nav";
import { MobileNav } from "@/components/mobile-nav";
import { getCurrentUserRole } from "@/features/auth/actions";

interface SiteHeaderProps {
  currentPath?: string;
}

export async function SiteHeader({ currentPath }: SiteHeaderProps) {
  const role = await getCurrentUserRole();

  return (
    <>
      {/* Decorative Top Border Ribbon */}
      <BrandBorder position="top" height="h-7 sm:h-9" />

      {/* Sticky Header Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md transition-colors">
        <div className="container mx-auto grid grid-cols-[1fr_auto_1fr] h-18 sm:h-20 items-center px-4 sm:px-6 lg:px-8">
          {/* Left: Mobile Nav + Logo */}
          <div className="flex items-center gap-2 sm:gap-2.5 justify-self-start">
            <MobileNav currentPath={currentPath} role={role} />
            <BrandLogo size="md" />
          </div>

          {/* Center: Main Navigation Tabs (Strictly Centered) */}
          <div className="flex justify-center">
            <MainNav currentPath={currentPath} />
          </div>

          {/* Right: Auth / Account Navigation */}
          <div className="flex items-center gap-2 sm:gap-3 justify-self-end">
            <AuthNav />
          </div>
        </div>
      </header>

    </>
  );
}

