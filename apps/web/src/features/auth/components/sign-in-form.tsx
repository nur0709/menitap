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
        <div className="p-3 text-sm text-rose-300 bg-rose-950/50 border border-rose-800/50 rounded-lg">
          {state.error}
        </div>
      )}

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
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-zinc-300 text-sm">Password</Label>
          <Link href="#" className="text-xs text-purple-400 hover:text-purple-300">
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
          className="bg-zinc-900 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-purple-500 h-11"
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium h-11 border-0"
      >
        {isPending ? 'Signing In...' : 'Sign In'}
      </Button>
    </form>
  )
}
