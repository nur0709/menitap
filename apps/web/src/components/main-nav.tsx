import Link from 'next/link'
import { cn } from '@/lib/utils'

interface MainNavProps {
  currentPath?: string
}

export function MainNav({ currentPath }: MainNavProps) {
  const navTabClass = (isActive: boolean) =>
    cn(
      'inline-flex items-center justify-center font-medium text-xs sm:text-sm px-3.5 h-9 rounded-lg border transition-all duration-150 cursor-pointer',
      'border-[#08739C] text-[#08739C] dark:border-[#38BDF8] dark:text-[#38BDF8]',
      isActive
        ? 'bg-[#08739C]/15 dark:bg-[#38BDF8]/20 font-bold shadow-xs'
        : 'bg-transparent hover:bg-[#08739C]/10 dark:hover:bg-[#38BDF8]/10'
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
