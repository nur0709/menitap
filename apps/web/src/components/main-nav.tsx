import Link from 'next/link'
import { getCurrentUserRole } from '@/features/auth/actions'
import { cn } from '@/lib/utils'

interface MainNavProps {
  currentPath?: string
  role?: string | null
}

export async function MainNav({ currentPath, role: roleProp }: MainNavProps) {
  const role = roleProp !== undefined ? roleProp : await getCurrentUserRole()

  const isCreator = role === 'CREATOR' || role === 'ADMIN'
  const isBrand = role === 'BRAND' || role === 'ADMIN'

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
      {/* Explore Deals: visible to everyone with or without account */}
      <Link
        href="/for-shoppers"
        className={navTabClass(currentPath === '/for-shoppers')}
      >
        Explore Deals
      </Link>

      {/* Campaign Links: visible to Creators, Brands, and Admins */}
      {(isCreator || isBrand) && (
        <Link
          href="/for-creators"
          className={navTabClass(currentPath === '/for-creators')}
        >
          Campaign Links
        </Link>
      )}

      {/* Explore Creators: only visible to brand accounts and admins */}
      {isBrand && (
        <Link
          href="/for-brands"
          className={navTabClass(currentPath === '/for-brands')}
        >
          Explore Creators
        </Link>
      )}

      {/* Plans: visible to everyone */}
      <Link
        href="/plans"
        className={navTabClass(currentPath === '/plans')}
      >
        Plans
      </Link>
    </nav>
  )
}

