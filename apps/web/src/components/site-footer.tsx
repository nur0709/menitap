'use client'

import React, { useState } from "react";
import Link from "next/link";
import { BrandBorder } from "@/components/brand-border";
import { BrandLogo } from "@/components/brand-logo";
import { X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteFooter() {
  const [privacyOpen, setPrivacyOpen] = useState(false);

  return (
    <>
      {/* Decorative Bottom Border Ribbon */}
      <BrandBorder position="bottom" height="h-7 sm:h-9" />

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 sm:py-10 transition-colors">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <BrandLogo size="md" />
          <p className="text-xs sm:text-sm text-muted-foreground">
            © 2026 Menitap. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs sm:text-sm text-muted-foreground">
            <Link href="/about" className="hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/post-collab" className="hover:text-foreground transition-colors">
              Post a Collab
            </Link>
            <Link href="/plans" className="hover:text-foreground transition-colors">
              Plans
            </Link>
            <button
              type="button"
              onClick={() => setPrivacyOpen(true)}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              Privacy
            </button>
          </div>
        </div>
      </footer>

      {/* Privacy Policy Modal */}
      {privacyOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div
            className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl space-y-4 text-left animate-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <h4 className="text-base font-bold text-foreground">Privacy Policy</h4>
              </div>
              <button
                type="button"
                onClick={() => setPrivacyOpen(false)}
                className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              <p>
                Menitap is committed to protecting your personal information. We only collect the minimal details needed to manage your creator profile, track brand campaigns, or save favorite deals.
              </p>
              <p>
                We do not sell, rent, or monetize your personal data with third-party advertisers. All social links and creator profiles are made public only when you explicitly choose to turn on your public Explore portfolio.
              </p>
              <p>
                You may request complete account and data deletion at any time directly from your account settings.
              </p>
            </div>

            <div className="pt-3 border-t border-border flex justify-end">
              <Button
                type="button"
                size="sm"
                onClick={() => setPrivacyOpen(false)}
                className="h-8 text-xs font-semibold px-4 cursor-pointer"
              >
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
