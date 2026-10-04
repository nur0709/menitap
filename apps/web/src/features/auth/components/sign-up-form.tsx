'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUpWithEmail, type AuthState } from '../actions'

export function SignUpForm() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    signUpWithEmail,
    {}
  )

  return (
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
        className="w-full bg-[#08739C] hover:bg-[#02547A] text-white font-medium h-11 border-0 shadow-sm transition-all"
      >
        {isPending ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  )
}
