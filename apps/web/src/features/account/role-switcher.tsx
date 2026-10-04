'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { switchUserRole } from '@/features/account/actions'
import { ShoppingBag, Video, Building2, Check, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

export type RoleType = 'USER' | 'CREATOR' | 'BRAND'

const ROLES: { id: RoleType; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'USER', label: 'Shopper Hub', icon: ShoppingBag, color: '#08739C' },
  { id: 'CREATOR', label: 'Creator Hub', icon: Video, color: '#FC801A' },
  { id: 'BRAND', label: 'Brand Hub', icon: Building2, color: '#08739C' },
]

export function RoleSwitcher({ currentRole }: { currentRole: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSwitch = (role: RoleType) => {
    if (role === currentRole || isPending) return

    startTransition(async () => {
      const formData = new FormData()
      formData.append('role', role)
      await switchUserRole(null, formData)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2 p-1.5 bg-muted/60 dark:bg-muted/30 border border-border rounded-xl">
      <span className="text-xs font-semibold text-muted-foreground px-2">Account View:</span>
      {ROLES.map(({ id, label, icon: Icon }) => {
        const isActive = currentRole === id
        return (
          <Button
            key={id}
            size="sm"
            variant={isActive ? 'default' : 'ghost'}
            disabled={isPending}
            onClick={() => handleSwitch(id)}
            className={cn(
              'h-8 text-xs font-semibold gap-1.5 rounded-lg transition-all',
              isActive
                ? id === 'CREATOR'
                  ? 'bg-[#FC801A] hover:bg-[#E66F0D] text-white shadow-xs border-0'
                  : 'bg-[#08739C] hover:bg-[#02547A] text-white shadow-xs border-0'
                : 'text-muted-foreground hover:text-foreground hover:bg-card border-transparent'
            )}
          >
            {isPending && !isActive ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <Icon className="h-3.5 w-3.5" />
            )}
            <span>{label}</span>
            {isActive && <Check className="h-3 w-3 stroke-[3]" />}
          </Button>
        )
      })}
    </div>
  )
}
