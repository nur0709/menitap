'use client'

import React, { useState, useEffect, useActionState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { BrandLogo } from '@/components/brand-logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  type AuthState,
} from '../actions'
import {
  X,
  Mail,
  ArrowLeft,
  Loader2,
  ShoppingBag,
  Video,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type AuthMode = 'login' | 'signup'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: AuthMode
}

type AccountType = 'USER' | 'CREATOR'

const ACCOUNT_TYPES = [
  {
    id: 'USER' as AccountType,
    label: 'Consumer',
    description: 'Find verified deals & honest creator reviews',
    icon: ShoppingBag,
  },
  {
    id: 'CREATOR' as AccountType,
    label: 'Creator',
    description: 'Get free products to review & share affiliate deals',
    icon: Video,
  },
]

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
  const [view, setView] = useState<'options' | 'email'>('options')
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [selectedRole, setSelectedRole] = useState<AccountType>('USER')

  // Close on Escape key & lock scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  // Login form action state
  const [loginState, loginFormAction, isLoginPending] = useActionState<AuthState, FormData>(
    signInWithEmail,
    {}
  )

  // Sign up form action state
  const [signUpState, signUpFormAction, isSignUpPending] = useActionState<AuthState, FormData>(
    signUpWithEmail,
    {}
  )

  if (!isOpen || !mounted) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-[9999] overflow-y-auto bg-black/60 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200"
    >
      <div className="flex min-h-full items-center justify-center">
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative my-auto w-full max-w-md rounded-2xl bg-card border border-border p-6 sm:p-7 shadow-2xl text-center animate-in zoom-in-95 duration-200"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3.5 top-3.5 sm:right-4 sm:top-4 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer z-20 flex items-center justify-center"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

        {/* Back Button (when in email form view) */}
        {view === 'email' && (
          <button
            onClick={() => setView('options')}
            className="absolute left-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer z-10 flex items-center gap-1 text-xs font-medium"
            aria-label="Back to options"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
        )}

        {/* Brand Header */}
        <div className="flex flex-col items-center mb-5">
          <BrandLogo size="md" />
        </div>

        {/* -------------------- VIEW 1: OPTIONS (Log in or sign up in seconds) -------------------- */}
        {view === 'options' ? (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                Log in or sign up in seconds
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                Connect with creators, discover verified discounts, and earn.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {/* Option 1: Continue with Google */}
              <form action={signInWithGoogle} className="w-full">
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full h-11 rounded-xl bg-card hover:bg-muted border border-border text-foreground font-semibold text-sm flex items-center justify-center gap-3 transition-colors cursor-pointer shadow-xs"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                  <span>Continue with Google</span>
                </Button>
              </form>

              {/* Option 2: Continue with email */}
              <Button
                type="button"
                onClick={() => setView('email')}
                className="w-full h-11 rounded-xl bg-[#FC801A] hover:bg-[#E66F0D] text-white font-semibold text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-xs border-0"
              >
                <Mail className="h-4 w-4 shrink-0" />
                <span>Continue with email</span>
              </Button>
            </div>

            <p className="text-[11px] text-muted-foreground pt-3 leading-relaxed">
              By continuing, you agree to Menitap&apos;s{' '}
              <Link href="#" className="underline hover:text-foreground">Terms</Link> and{' '}
              <Link href="#" className="underline hover:text-foreground">Privacy Policy</Link>.
            </p>
          </div>
        ) : (
          /* -------------------- VIEW 2: EMAIL FORM -------------------- */
          <div className="space-y-4 text-left">
            {/* Mode Switcher Tabs */}
            <div className="flex rounded-xl bg-muted p-1">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={cn(
                  'flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all text-center cursor-pointer',
                  mode === 'login'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={cn(
                  'flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all text-center cursor-pointer',
                  mode === 'signup'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Sign Up
              </button>
            </div>

            {mode === 'login' ? (
              /* LOG IN WITH EMAIL */
              <form action={loginFormAction} className="space-y-3.5">
                {loginState?.error && (
                  <div className="p-2.5 text-xs font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{loginState.error}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="modal-login-email" className="text-xs font-medium text-foreground">
                    Email Address
                  </Label>
                  <Input
                    id="modal-login-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    className="h-9 text-xs bg-background border-border"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="modal-login-password" className="text-xs font-medium text-foreground">
                      Password
                    </Label>
                  </div>
                  <Input
                    id="modal-login-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    className="h-9 text-xs bg-background border-border"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoginPending}
                  className="w-full h-10 rounded-xl bg-[#08739C] hover:bg-[#02547A] text-white font-semibold text-xs border-0 shadow-xs cursor-pointer mt-2"
                >
                  {isLoginPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In with Email'
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground pt-1">
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="text-[#FC801A] font-semibold hover:underline cursor-pointer"
                  >
                    Sign up
                  </button>
                </p>
              </form>
            ) : (
              /* SIGN UP WITH EMAIL */
              <form action={signUpFormAction} className="space-y-3">
                {signUpState?.error && (
                  <div className="p-2.5 text-xs font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{signUpState.error}</span>
                  </div>
                )}

                {signUpState?.success && (
                  <div className="p-2.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    {signUpState.success}
                  </div>
                )}

                {/* Account Type Selector */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-foreground">Account Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {ACCOUNT_TYPES.map((type) => {
                      const isSelected = selectedRole === type.id
                      const Icon = type.icon
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setSelectedRole(type.id)}
                          className={cn(
                            'p-2 rounded-lg border text-center transition-all flex flex-col items-center gap-1 cursor-pointer',
                            isSelected
                              ? 'border-[#FC801A] bg-[#FC801A]/10 text-[#FC801A] font-bold shadow-xs'
                              : 'border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50'
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          <span className="text-[11px] leading-tight">{type.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <input type="hidden" name="role" value={selectedRole} />

                <div className="space-y-1">
                  <Label htmlFor="modal-signup-name" className="text-xs font-medium text-foreground">
                    Full Name
                  </Label>
                  <Input
                    id="modal-signup-name"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    placeholder="Alex Rivera"
                    className="h-9 text-xs bg-background border-border"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="modal-signup-email" className="text-xs font-medium text-foreground">
                    Email Address
                  </Label>
                  <Input
                    id="modal-signup-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    className="h-9 text-xs bg-background border-border"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="modal-signup-password" className="text-xs font-medium text-foreground">
                    Password (min. 6 chars)
                  </Label>
                  <Input
                    id="modal-signup-password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    placeholder="••••••••"
                    className="h-9 text-xs bg-background border-border"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSignUpPending}
                  className="w-full h-10 rounded-xl bg-[#FC801A] hover:bg-[#E66F0D] text-white font-semibold text-xs border-0 shadow-xs cursor-pointer mt-1"
                >
                  {isSignUpPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                      Creating Account...
                    </>
                  ) : (
                    `Create ${selectedRole === 'CREATOR' ? 'Creator' : 'Consumer'} Account`
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground pt-1">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-[#FC801A] font-semibold hover:underline cursor-pointer"
                  >
                    Log in
                  </button>
                </p>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  </div>,
  document.body
  )
}
