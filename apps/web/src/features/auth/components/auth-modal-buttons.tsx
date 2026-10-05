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
      <div className={cn('flex items-center gap-1.5 sm:gap-2', className)}>
        {/* Sign up Button */}
        <Button
          type="button"
          size="sm"
          onClick={() => handleOpen('signup')}
          className="bg-[#FC801A] hover:bg-[#E66F0D] text-white font-semibold text-xs sm:text-sm px-3 sm:px-4 h-9 rounded-lg border-0 shadow-xs cursor-pointer transition-all"
        >
          Sign up
        </Button>

        {/* Log in Button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleOpen('login')}
          className="border border-[#FC801A] text-[#FC801A] hover:bg-[#FC801A]/10 hover:text-[#FC801A] hover:border-[#FC801A] font-semibold text-xs sm:text-sm px-3 sm:px-3.5 h-9 rounded-lg cursor-pointer transition-all"
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
