import Link from 'next/link'
import { getCurrentUserRole } from '@/features/auth/actions'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MainNavProps {
  currentPath?: string
  role?: string | null
}

export async function MainNav({ currentPath, role: roleProp }: MainNavProps) {
  const role = roleProp !== undefined ? roleProp : await getCurrentUserRole()

  const isCreator = role === 'CREATOR' || role === 'ADMIN'
  const isBrand = role === 'BRAND' || role === 'ADMIN'

  return (
    <nav className="hidden items-center gap-2 md:flex" aria-label="Main Navigation">
      {/* Explore Deals: visible to everyone with or without account */}
      <Link
        href="/for-shoppers"
        className={cn(
          buttonVariants({ size: 'sm' }),
          'font-medium text-xs sm:text-sm px-3.5 h-9 border-0 transition-all duration-150',
          currentPath === '/for-shoppers'
            ? 'bg-[#02547A] text-white shadow-md ring-2 ring-[#FC801A] font-semibold ring-offset-1 ring-offset-background'
            : 'bg-[#08739C] hover:bg-[#02547A] text-white shadow-sm'
        )}
      >
        Explore Deals
      </Link>

      {/* Campaign Links: visible to Creators, Brands, and Admins */}
      {(isCreator || isBrand) && (
        <Link
          href="/for-creators"
          className={cn(
            buttonVariants({ size: 'sm' }),
            'font-medium text-xs sm:text-sm px-3.5 h-9 border-0 transition-all duration-150',
            currentPath === '/for-creators'
              ? 'bg-[#02547A] text-white shadow-md ring-2 ring-[#FC801A] font-semibold ring-offset-1 ring-offset-background'
              : 'bg-[#08739C] hover:bg-[#02547A] text-white shadow-sm'
          )}
        >
          Campaign Links
        </Link>
      )}

      {/* Explore Creators: only visible to brand accounts and admins */}
      {isBrand && (
        <Link
          href="/for-brands"
          className={cn(
            buttonVariants({ size: 'sm' }),
            'font-medium text-xs sm:text-sm px-3.5 h-9 border-0 transition-all duration-150',
            currentPath === '/for-brands'
              ? 'bg-[#02547A] text-white shadow-md ring-2 ring-[#FC801A] font-semibold ring-offset-1 ring-offset-background'
              : 'bg-[#08739C] hover:bg-[#02547A] text-white shadow-sm'
          )}
        >
          Explore Creators
        </Link>
      )}

      {/* Plans: visible to everyone */}
      <Link
        href="/plans"
        className={cn(
          buttonVariants({ size: 'sm' }),
          'font-medium text-xs sm:text-sm px-3.5 h-9 border-0 transition-all duration-150',
          currentPath === '/plans'
            ? 'bg-[#02547A] text-white shadow-md ring-2 ring-[#FC801A] font-semibold ring-offset-1 ring-offset-background'
            : 'bg-[#08739C] hover:bg-[#02547A] text-white shadow-sm'
        )}
      >
        Plans
      </Link>
    </nav>
  )
}

