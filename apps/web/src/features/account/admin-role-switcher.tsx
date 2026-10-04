'use client'

import { useTransition } from 'react'
import { adminSwitchMode } from './actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShieldCheck, Loader2 } from 'lucide-react'

interface AdminRoleSwitcherProps {
  currentMode: string | null
}

const MODES = [
  { id: 'ADMIN', label: 'Admin (Full Access)' },
  { id: 'USER', label: 'Explorer' },
  { id: 'CREATOR_BASIC', label: 'Creator Basic' },
  { id: 'CREATOR_STANDARD', label: 'Creator Standard' },
  { id: 'BRAND', label: 'Brand' },
] as const

export function AdminRoleSwitcher({ currentMode }: AdminRoleSwitcherProps) {
  const [isPending, startTransition] = useTransition()

  const activeMode = currentMode || 'ADMIN'

  const handleSelectMode = (mode: 'USER' | 'CREATOR_BASIC' | 'CREATOR_STANDARD' | 'BRAND' | 'ADMIN') => {
    startTransition(async () => {
      await adminSwitchMode(mode)
      window.location.reload()
    })
  }

  return (
    <div className="w-full pt-6 border-t border-destructive/20 mt-6">
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-left">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-destructive" />
            <span className="text-xs font-bold uppercase tracking-wider text-destructive">
              Admin Mode Switcher
            </span>
          </div>
          {currentMode && currentMode !== 'ADMIN' ? (
            <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/30">
              Simulating: {MODES.find((m) => m.id === currentMode)?.label}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/30">
              Default (Full View)
            </Badge>
          )}
        </div>

        <p className="text-xs text-muted-foreground mb-3">
          Preview the application and test tabs exactly as each account type experiences it:
        </p>

        <div className="flex flex-wrap gap-2">
          {MODES.map((mode) => {
            const isSelected = activeMode === mode.id
            return (
              <Button
                key={mode.id}
                type="button"
                size="sm"
                variant={isSelected ? 'default' : 'outline'}
                disabled={isPending}
                onClick={() => handleSelectMode(mode.id)}
                className={`text-xs h-8 cursor-pointer ${
                  isSelected
                    ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90 border-0'
                    : 'border-border text-foreground hover:bg-muted'
                }`}
              >
                {isPending && isSelected && (
                  <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                )}
                {mode.label}
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
