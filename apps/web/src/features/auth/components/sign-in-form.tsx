'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signInWithEmail, type AuthState } from '../actions'

export function SignInForm() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    signInWithEmail,
    {}
  )

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground text-sm font-medium">Email Address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="creator@example.com"
          className="bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-[#08739C] h-11"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-foreground text-sm font-medium">Password</Label>
          <Link href="#" className="text-xs text-[#FC801A] hover:underline">
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
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
        {isPending ? 'Signing In...' : 'Sign In'}
      </Button>
    </form>
  )
}
