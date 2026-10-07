'use client'

import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AuthCard, type AuthMode, type AccountType } from './auth-card'

export type { AuthMode, AccountType }

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: AuthMode
  initialRole?: AccountType
}

export function AuthModal({
  isOpen,
  onClose,
  initialMode = 'login',
  initialRole = 'USER',
}: AuthModalProps) {
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

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

  if (!isOpen || !mounted) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] overflow-y-auto bg-black/60 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200"
    >
      <div className="flex min-h-full items-center justify-center">
        <AuthCard
          initialMode={initialMode}
          initialRole={initialRole}
          onClose={onClose}
          showCloseButton
          className="shadow-2xl animate-in zoom-in-95 duration-200"
        />
      </div>
    </div>,
    document.body
  )
}
