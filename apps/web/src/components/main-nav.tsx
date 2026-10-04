import Link from 'next/link'
import { getCurrentUserRole } from '@/features/auth/actions'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MainNavProps {
  currentPath?: string
}

export async function MainNav({ currentPath }: MainNavProps) {
  const role = await getCurrentUserRole()

  const isCreator = role === 'CREATOR' || role === 'ADMIN'
  const isBrand = role === 'BRAND' || role === 'ADMIN'

  return (
    <nav className="hidden items-center gap-1.5 md:flex">
      {/* Explore Deals: visible to everyone with or without account */}
      <Link
        href="/for-shoppers"
        className={cn(
          buttonVariants({ size: 'sm' }),
          'bg-[#08739C] hover:bg-[#02547A] text-white shadow-sm font-medium text-xs sm:text-sm px-3.5 h-9 border-0',
          currentPath === '/for-shoppers' && 'ring-2 ring-[#08739C]/40'
        )}
      >
        Explore Deals
      </Link>

      {/* For Creators: only visible to creator accounts */}
      {isCreator && (
        <Link
          href="/for-creators"
          className={cn(
            buttonVariants({ size: 'sm' }),
            'bg-[#08739C] hover:bg-[#02547A] text-white shadow-sm font-medium text-xs sm:text-sm px-3.5 h-9 border-0',
            currentPath === '/for-creators' && 'ring-2 ring-[#08739C]/40'
          )}
        >
          For Creators
        </Link>
      )}

      {/* For Brands: only visible to brand accounts */}
      {isBrand && (
        <Link
          href="/for-brands"
          className={cn(
            buttonVariants({ size: 'sm' }),
            'bg-[#08739C] hover:bg-[#02547A] text-white shadow-sm font-medium text-xs sm:text-sm px-3.5 h-9 border-0',
            currentPath === '/for-brands' && 'ring-2 ring-[#08739C]/40'
          )}
        >
          For Brands
        </Link>
      )}

      {/* Plans: visible to everyone */}
      <Link
        href="/plans"
        className={cn(
          buttonVariants({ size: 'sm' }),
          'bg-[#08739C] hover:bg-[#02547A] text-white shadow-sm font-medium text-xs sm:text-sm px-3.5 h-9 border-0',
          currentPath === '/plans' && 'ring-2 ring-[#08739C]/40'
        )}
      >
        Plans
      </Link>
    </nav>
  )
}
