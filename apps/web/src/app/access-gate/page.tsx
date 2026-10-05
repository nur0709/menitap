import React from 'react'
import { BrandBorder } from '@/components/brand-border'
import { BrandLogo } from '@/components/brand-logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { AccessForm } from './access-form'
import { ShieldCheck } from 'lucide-react'

export const metadata = {
  title: 'Private Preview Access | Menitap',
  description: 'Enter site access passcode to view Menitap private preview.',
}

export default async function AccessGatePage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>
}) {
  const { returnTo } = await searchParams

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-[#FC801A]/30 transition-colors">
      <BrandBorder position="top" height="h-7 sm:h-9" />

      {/* Floating Theme Toggle in top-right */}
      <div className="absolute top-10 right-4 sm:right-8 z-10">
        <ThemeToggle />
      </div>

      <main className="container mx-auto px-4 sm:px-6 py-12 flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md bg-card border-border shadow-xl rounded-2xl overflow-hidden text-center">
          <CardHeader className="flex flex-col items-center pt-8 pb-4 space-y-3">
            <BrandLogo size="lg" />

            <div className="pt-2 flex justify-center">
              <Badge
                variant="outline"
                className="text-xs px-3 py-1 font-semibold flex items-center gap-1.5 bg-[#08739C]/10 text-[#08739C] dark:text-[#38BDF8] border-[#08739C]/30"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Private Preview</span>
              </Badge>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              Enter Access Code
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xs mx-auto">
              Menitap is currently in private preview. Please enter the site passcode to continue.
            </p>
          </CardHeader>

          <CardContent className="px-6 pb-8 pt-2">
            <AccessForm returnTo={returnTo} />
          </CardContent>
        </Card>
      </main>

      <BrandBorder position="bottom" height="h-7 sm:h-9" />
    </div>
  )
}
