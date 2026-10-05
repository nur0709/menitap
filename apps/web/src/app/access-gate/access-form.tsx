'use client'

import { useActionState } from 'react'
import { verifyAccessCode, type AccessGateState } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react'

export function AccessForm({ returnTo = '/' }: { returnTo?: string }) {
  const [state, formAction, isPending] = useActionState<AccessGateState, FormData>(
    verifyAccessCode,
    {}
  )

  return (
    <form action={formAction} className="space-y-4 text-left">
      <input type="hidden" name="returnTo" value={returnTo} />

      {state?.error && (
        <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="code" className="text-xs font-semibold text-foreground">
          Site Access Passcode
        </Label>
        <div className="relative">
          <Lock className="h-4 w-4 absolute left-3 top-3.5 text-muted-foreground" />
          <Input
            id="code"
            name="code"
            type="password"
            autoComplete="current-password"
            autoFocus
            required
            placeholder="Enter passcode..."
            className="pl-9 bg-background border-border text-foreground placeholder:text-muted-foreground h-11 text-sm focus-visible:ring-[#08739C]"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-[#FC801A] hover:bg-[#E66F0D] text-white font-semibold h-11 rounded-xl border-0 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Verifying...</span>
          </>
        ) : (
          <>
            <span>Unlock Menitap</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>

      <p className="text-[11px] text-center text-muted-foreground pt-1">
        Authorized testers and reviewers only. Contact the site administrator for an access invite.
      </p>
    </form>
  )
}
