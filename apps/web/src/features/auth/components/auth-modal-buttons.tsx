'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AuthModal, type AuthMode } from './auth-modal'
import { cn } from '@/lib/utils'

export function AuthModalButtons({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<AuthMode>('login')

  const handleOpen = (initialMode: AuthMode) => {
    setMode(initialMode)
    setIsOpen(true)
  }

  return (
    <>
      <div className={cn('flex items-center gap-3', className)}>
        {/* Sign up Button */}
        <Button
          type="button"
          size="lg"
          onClick={() => handleOpen('signup')}
          className="bg-[#FC801A] hover:bg-[#E66F0D] text-white font-semibold text-sm sm:text-base px-6 sm:px-8 h-11 rounded-xl border-0 shadow-sm cursor-pointer transition-all"
        >
          Sign up
        </Button>

        {/* Log in Button */}
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => handleOpen('login')}
          className="bg-card hover:bg-muted text-foreground border-border font-semibold text-sm sm:text-base px-6 sm:px-8 h-11 rounded-xl shadow-sm cursor-pointer transition-colors"
        >
          Log in
        </Button>
      </div>

      {/* Pop up Modal */}
      {isOpen && (
        <AuthModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          initialMode={mode}
        />
      )}
    </>
  )
}
