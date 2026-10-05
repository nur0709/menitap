'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthModal } from '@/features/auth/components/auth-modal'
import { CreatorUpgradeModal } from '@/features/account/creator-upgrade-modal'
import { ArrowRight } from 'lucide-react'

interface BecomeCreatorCtaProps {
  isAuthenticated: boolean
  role: string | null
}

export function BecomeCreatorCta({ isAuthenticated, role }: BecomeCreatorCtaProps) {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)
  const router = useRouter()

  const handleClick = () => {
    if (!isAuthenticated) {
      // 1. Signed out: Pop up sign up / log in modal preset to Creator
      setAuthModalOpen(true)
      return
    }

    const normalizedRole = (role || 'USER').toUpperCase()

    if (normalizedRole === 'USER') {
      // 2. Signed in as free consumer account: Pop up Creator upgrade / plan selection modal
      setUpgradeModalOpen(true)
      return
    }

    // 3. Already a creator or admin: Navigate directly to creators hub
    router.push('/for-creators')
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="text-sm font-semibold text-[#FC801A] hover:underline inline-flex items-center gap-1.5 cursor-pointer bg-transparent border-0 p-0 text-left"
      >
        Become a Creator <ArrowRight className="h-3.5 w-3.5" />
      </button>

      {/* Auth Modal for signed-out users */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode="signup"
        initialRole="CREATOR"
      />

      {/* Upgrade Modal for logged-in free consumer users */}
      <CreatorUpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
      />
    </>
  )
}
