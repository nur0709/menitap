import Link from 'next/link'
import { cn } from '@/lib/utils'

interface MainNavProps {
  currentPath?: string
}

export function MainNav({ currentPath }: MainNavProps) {
  const navTabClass = (isActive: boolean) =>
    cn(
      'inline-flex items-center justify-center text-xs sm:text-sm px-3.5 h-9 rounded-lg transition-all duration-150 cursor-pointer',
      isActive
        ? 'ring-2 ring-[#FC801A] text-[#FC801A] bg-[#FC801A]/10 font-bold shadow-xs'
        : 'text-muted-foreground hover:text-foreground hover:ring-1 hover:ring-[#FC801A]/50 hover:bg-[#FC801A]/5 font-medium'
    )

  return (
    <nav className="hidden items-center gap-2 md:flex" aria-label="Main Navigation">
      {/* 1. Deals */}
      <Link
        href="/deals"
        className={navTabClass(currentPath === '/deals')}
      >
        Deals
      </Link>

      {/* 2. Brand Collabs */}
      <Link
        href="/collabs"
        className={navTabClass(currentPath === '/collabs')}
      >
        Brand Collabs
      </Link>

      {/* 3. Creators */}
      <Link
        href="/creators"
        className={navTabClass(currentPath === '/creators')}
      >
        Creators
      </Link>

      {/* 4. Plans */}
      <Link
        href="/plans"
        className={navTabClass(currentPath === '/plans')}
      >
        Plans
      </Link>
    </nav>
  )
}
