'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUpWithEmail, type AuthState } from '../actions'
import { ShoppingBag, Video, Building2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export type AccountType = 'USER' | 'CREATOR' | 'BRAND'

const ACCOUNT_TYPES = [
  {
    id: 'USER' as AccountType,
    label: 'Shopper',
    badge: 'Free',
    description: 'Find verified deals & watch product reviews',
    icon: ShoppingBag,
    color: '#08739C',
  },
  {
    id: 'CREATOR' as AccountType,
    label: 'Creator',
    badge: '$0 Trial',
    description: 'Get products to review & share affiliate links',
    icon: Video,
    color: '#FC801A',
  },
  {
    id: 'BRAND' as AccountType,
    label: 'Brand / Agency',
    badge: 'Free',
    description: 'Post review campaigns & discover creators',
    icon: Building2,
    color: '#08739C',
  },
]

export function SignUpForm({ defaultRole = 'USER' }: { defaultRole?: AccountType }) {
  const [selectedRole, setSelectedRole] = useState<AccountType>(defaultRole)
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    signUpWithEmail,
    {}
  )

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="p-3 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 rounded-lg">
          {state.success}
        </div>
      )}

      {/* Account Type Selection */}
      <div className="space-y-2">
        <Label className="text-foreground text-sm font-semibold flex items-center justify-between">
          <span>Choose Account Type</span>
          <span className="text-[11px] font-normal text-muted-foreground">No card required</span>
        </Label>
        <input type="hidden" name="role" value={selectedRole} />
        
        <div className="grid grid-cols-1 gap-2.5">
          {ACCOUNT_TYPES.map((type) => {
            const isSelected = selectedRole === type.id
            const Icon = type.icon
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => setSelectedRole(type.id)}
                className={cn(
                  'w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all',
                  isSelected
                    ? type.id === 'CREATOR'
                      ? 'border-[#FC801A] bg-[#FC801A]/10 ring-1 ring-[#FC801A]'
                      : 'border-[#08739C] bg-[#08739C]/10 ring-1 ring-[#08739C]'
                    : 'border-border bg-card hover:bg-muted/50'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'h-9 w-9 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                      isSelected
                        ? type.id === 'CREATOR'
                          ? 'bg-[#FC801A] text-white'
                          : 'bg-[#08739C] text-white'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{type.label}</span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {type.badge}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                  </div>
                </div>

                <div
                  className={cn(
                    'h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ml-2 transition-colors',
                    isSelected
                      ? type.id === 'CREATOR'
                        ? 'border-[#FC801A] bg-[#FC801A] text-white'
                        : 'border-[#08739C] bg-[#08739C] text-white'
                      : 'border-muted-foreground/30 bg-transparent'
                  )}
                >
                  {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-foreground text-sm font-medium">Full Name</Label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          placeholder="Alex Rivera"
          className="bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-[#08739C] h-11"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground text-sm font-medium">Email Address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className="bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-[#08739C] h-11"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-foreground text-sm font-medium">Password (min. 6 characters)</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="••••••••"
          className="bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-[#08739C] h-11"
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className={cn(
          'w-full text-white font-medium h-11 border-0 shadow-sm transition-all',
          selectedRole === 'CREATOR'
            ? 'bg-[#FC801A] hover:bg-[#E66F0D]'
            : 'bg-[#08739C] hover:bg-[#02547A]'
        )}
      >
        {isPending
          ? 'Creating Account...'
          : `Create ${selectedRole === 'CREATOR' ? 'Creator' : selectedRole === 'BRAND' ? 'Brand' : 'Shopper'} Account`}
      </Button>
    </form>
  )
}
