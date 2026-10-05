'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AuthModal, type AccountType } from '@/features/auth/components/auth-modal'
import { cn } from '@/lib/utils'

interface PlanCtaButtonProps {
  role: AccountType
  children: React.ReactNode
  variant?: 'outline' | 'default'
  className?: string
}

export function PlanCtaButton({
  role,
  children,
  variant = 'default',
  className,
}: PlanCtaButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        type="button"
        variant={variant}
        onClick={() => setIsOpen(true)}
        className={cn('w-full font-semibold cursor-pointer transition-all', className)}
      >
        {children}
      </Button>

      {isOpen && (
        <AuthModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          initialMode="signup"
          initialRole={role}
        />
      )}
    </>
  )
}
