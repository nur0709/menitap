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
      <BrandBorder position="top" height="h-7 sm:h-9" />

      {/* Top Controls */}
      <div className="absolute top-8 right-4 sm:right-8 z-20">
        <ThemeToggle />
      </div>

      {/* Center Auth Card */}
      <main className="w-full max-w-md px-4 py-8 sm:py-12 relative z-10 flex flex-col items-center justify-center flex-1">
        {children}
      </main>

      {/* Decorative Bottom Border Ribbon */}
      <BrandBorder position="bottom" height="h-7 sm:h-9" />
    </div>
  )
}
