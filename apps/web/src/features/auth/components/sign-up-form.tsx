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
        <div className="p-3 text-sm text-rose-300 bg-rose-950/50 border border-rose-800/50 rounded-lg">
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="p-3 text-sm text-emerald-300 bg-emerald-950/50 border border-emerald-800/50 rounded-lg">
          {state.success}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-zinc-300 text-sm">Full Name</Label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          placeholder="Alex Rivera"
          className="bg-zinc-900 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-purple-500 h-11"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-zinc-300 text-sm">Email Address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="creator@example.com"
          className="bg-zinc-900 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-purple-500 h-11"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-zinc-300 text-sm">Password (min. 6 characters)</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="••••••••"
          className="bg-zinc-900 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-purple-500 h-11"
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium h-11 border-0"
      >
        {isPending ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  )
}
