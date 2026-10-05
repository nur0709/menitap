'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUpWithEmail, signInWithGoogle, type AuthState } from '../actions'
import { ShoppingBag, Video, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export type AccountType = 'USER' | 'CREATOR'

const ACCOUNT_TYPES = [
  {
    id: 'USER' as AccountType,
    label: 'Consumer',
    description: 'Find verified creator discounts & honest reviews',
    icon: ShoppingBag,
    color: '#08739C',
  },
  {
    id: 'CREATOR' as AccountType,
    label: 'Creator',
    description: 'Get free products for reviews & share affiliate deals',
    icon: Video,
    color: '#FC801A',
  },
]

export function SignUpForm({ defaultRole = 'USER' }: { defaultRole?: AccountType }) {
  const [selectedRole, setSelectedRole] = useState<AccountType>(defaultRole)
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    signUpWithEmail,
    {}
  )

  const roleLabel = selectedRole === 'CREATOR' ? 'Creator' : 'Consumer'

  return (
    <div className="space-y-5">
      {/* Step 1: Choose Account Type */}
      <div className="space-y-2">
        <Label className="text-foreground text-sm font-semibold flex items-center justify-between">
          <span>Choose Account Type</span>
          <span className="text-[11px] font-normal text-muted-foreground">Free to join</span>
        </Label>

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
                  'w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer',
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
                    <span className="text-sm font-bold text-foreground block">{type.label}</span>
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

      {/* Google Sign-Up button passing the selected role */}
      <form action={signInWithGoogle} className="w-full">
        <input type="hidden" name="role" value={selectedRole} />
        <Button
          type="submit"
          variant="outline"
          className="w-full flex items-center justify-center gap-3 bg-card hover:bg-accent border border-border text-foreground h-11 shadow-sm font-medium transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Sign up with Google as {roleLabel}</span>
        </Button>
      </form>

      <div className="relative flex items-center justify-center">
        <div className="border-t border-border w-full" />
        <span className="bg-card px-3 text-xs uppercase text-muted-foreground font-medium">
          or with email
        </span>
        <div className="border-t border-border w-full" />
      </div>

      {/* Email Sign-Up Form */}
      <form action={formAction} className="space-y-4">
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

        <input type="hidden" name="role" value={selectedRole} />

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
            'w-full text-white font-medium h-11 border-0 shadow-sm transition-all cursor-pointer',
            selectedRole === 'CREATOR'
              ? 'bg-[#FC801A] hover:bg-[#E66F0D]'
              : 'bg-[#08739C] hover:bg-[#02547A]'
          )}
        >
          {isPending
            ? 'Creating Account...'
            : `Create ${roleLabel} Account`}
        </Button>
      </form>
    </div>
  )
}
