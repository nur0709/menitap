import Link from 'next/link'
import { BrandLogo } from '@/components/brand-logo'
import { BrandBorder } from '@/components/brand-border'
import { ThemeToggle } from '@/components/theme-toggle'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between items-center relative overflow-hidden transition-colors">
      {/* Decorative Top Border Ribbon */}
      <BrandBorder position="top" height="h-6 sm:h-8" />

      {/* Top Controls */}
      <div className="absolute top-8 right-4 sm:right-8 z-20">
        <ThemeToggle />
      </div>

      {/* Center Auth Card */}
      <div className="w-full max-w-md px-4 py-8 sm:py-12 relative z-10 flex flex-col items-center">
        {/* Brand Header */}
        <div className="mb-6 text-center">
          <BrandLogo size="lg" />
          <p className="mt-3 text-sm text-muted-foreground">
            User-Generated Content & Deals Platform
          </p>
        </div>

        {/* Main Form Container */}
        <div className="w-full">
          {children}
        </div>

        {/* Footer links */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          By continuing, you agree to Menitap&apos;s{' '}
          <Link href="#" className="underline hover:text-foreground transition-colors">Terms of Service</Link>{' '}
          and{' '}
          <Link href="#" className="underline hover:text-foreground transition-colors">Privacy Policy</Link>.
        </div>
      </div>

      {/* Decorative Bottom Border Ribbon */}
      <BrandBorder position="bottom" height="h-6 sm:h-8" />
    </div>
  )
}
