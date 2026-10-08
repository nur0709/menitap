'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  setPublicProfileVisibility,
  updateCreatorLinks,
  upgradeToCreator,
  downgradeToConsumer,
  deleteUserAccount,
} from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { InstagramLogo, TikTokLogo, YouTubeLogo } from '@/components/social-icons'
import { Check, Loader2, AlertCircle, X, ExternalLink, Trash2, AlertTriangle, ArrowRight } from 'lucide-react'

interface CreatorProfileData {
  is_public_profile?: boolean | null
  instagram_url?: string | null
  tiktok_url?: string | null
  youtube_url?: string | null
  bio?: string | null
}

function extractHandle(url: string | null | undefined): string {
  if (!url) return ''
  const trimmed = url.trim()
  if (trimmed.startsWith('@')) return trimmed
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return `@${trimmed}`

  try {
    const u = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`)
    const pathname = u.pathname.replace(/^\//, '').replace(/\/$/, '')
    const handle = pathname.replace(/^@/, '')
    return handle ? `@${handle}` : ''
  } catch {
    return trimmed
  }
}

function formatSocialUrl(handleOrUrl: string, platform: 'instagram' | 'tiktok' | 'youtube'): string {
  const trimmed = handleOrUrl.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed
  const cleanHandle = trimmed.replace(/^@/, '')
  if (platform === 'instagram') return `https://instagram.com/${cleanHandle}`
  if (platform === 'tiktok') return `https://tiktok.com/@${cleanHandle}`
  if (platform === 'youtube') return `https://youtube.com/@${cleanHandle}`
  return trimmed
}

interface CreatorPublicProfileManagerProps {
  profile: CreatorProfileData
  effectivePlan?: string
}

export function CreatorPublicProfileManager({
  profile,
  effectivePlan = 'FREE',
}: CreatorPublicProfileManagerProps) {
  const normalizedPlan = (effectivePlan || 'FREE').toUpperCase()

  // Public toggle state
  const [isPublic, setIsPublic] = useState(Boolean(profile.is_public_profile))
  const [isToggling, startToggleTransition] = useTransition()
  const [toggleFeedback, setToggleFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null)

  // Switch Plan modal state
  const [switchPlanModalOpen, setSwitchPlanModalOpen] = useState(false)
  const [planActionPending, startPlanTransition] = useTransition()
  const [planError, setPlanError] = useState<string | null>(null)

  // Delete Account modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletePending, startDeleteTransition] = useTransition()
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const router = useRouter()

  // Handle switching membership plan
  const handleSwitchPlan = (targetPlan: 'FREE' | 'BASIC' | 'STANDARD') => {
    setPlanError(null)
    startPlanTransition(async () => {
      let res: { error?: string; success?: string }
      if (targetPlan === 'FREE') {
        res = await downgradeToConsumer()
      } else {
        res = await upgradeToCreator(targetPlan)
      }

      if (res.error) {
        setPlanError(res.error)
      } else {
        setSwitchPlanModalOpen(false)
        router.refresh()
      }
    })
  }

  // Handle permanent account deletion
  const handleDeleteAccount = () => {
    setDeleteError(null)
    startDeleteTransition(async () => {
      const res = await deleteUserAccount()
      if (res.error) {
        setDeleteError(res.error)
      } else {
        router.push('/')
        router.refresh()
      }
    })
  }

  // Current links state
  const [instagram, setInstagram] = useState(profile.instagram_url || '')
  const [tiktok, setTiktok] = useState(profile.tiktok_url || '')
  const [youtube, setYoutube] = useState(profile.youtube_url || '')
  const [bio, setBio] = useState(profile.bio || '')

  // Modal dialog state for clicking a social platform
  const [modalPlatform, setModalPlatform] = useState<'instagram' | 'tiktok' | 'youtube' | null>(null)
  const [modalHandleInput, setModalHandleInput] = useState('')

  const [isSaving, startSaveTransition] = useTransition()
  const [saveFeedback, setSaveFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null)

  const hasAnyLink = Boolean(instagram.trim() || tiktok.trim() || youtube.trim())

  // Open modal for a platform
  const openModal = (platform: 'instagram' | 'tiktok' | 'youtube') => {
    const currentUrl = platform === 'instagram' ? instagram : platform === 'tiktok' ? tiktok : youtube
    setModalHandleInput(extractHandle(currentUrl).replace(/^@/, ''))
    setModalPlatform(platform)
  }

  // Toggle public profile visibility
  const handleToggle = (newCheckedState: boolean) => {
    setToggleFeedback(null)

    if (newCheckedState && !hasAnyLink) {
      setToggleFeedback({
        type: 'error',
        message: 'Please connect at least one social media account before enabling your public profile.',
      })
      return
    }

    startToggleTransition(async () => {
      const res = await setPublicProfileVisibility(newCheckedState)
      if (res.error) {
        setToggleFeedback({ type: 'error', message: res.error })
      } else {
        setIsPublic(newCheckedState)
        setToggleFeedback({
          type: 'success',
          message: res.success || (newCheckedState ? 'Public profile activated!' : 'Public profile hidden.'),
        })
        setTimeout(() => setToggleFeedback(null), 3500)
      }
    })
  }

  // Save social platform handle from modal
  const handleSaveModal = () => {
    if (!modalPlatform) return
    setSaveFeedback(null)
    const newUrl = formatSocialUrl(modalHandleInput, modalPlatform)

    let newInstagram = instagram
    let newTiktok = tiktok
    let newYoutube = youtube

    if (modalPlatform === 'instagram') newInstagram = newUrl
    if (modalPlatform === 'tiktok') newTiktok = newUrl
    if (modalPlatform === 'youtube') newYoutube = newUrl

    // If public profile is active, disallow removing all links
    if (isPublic && !newInstagram && !newTiktok && !newYoutube) {
      setSaveFeedback({
        type: 'error',
        message: 'Your public profile is active! You must keep at least one connected social account.',
      })
      return
    }

    const formData = new FormData()
    formData.append('instagram_url', newInstagram)
    formData.append('tiktok_url', newTiktok)
    formData.append('youtube_url', newYoutube)
    formData.append('bio', bio)

    startSaveTransition(async () => {
      const res = await updateCreatorLinks(formData)
      if (res.error) {
        setSaveFeedback({ type: 'error', message: res.error })
      } else {
        if (modalPlatform === 'instagram') setInstagram(newInstagram)
        if (modalPlatform === 'tiktok') setTiktok(newTiktok)
        if (modalPlatform === 'youtube') setYoutube(newYoutube)
        const updatedPlatformName = modalPlatform.charAt(0).toUpperCase() + modalPlatform.slice(1)
        setModalPlatform(null)
        setSaveFeedback({
          type: 'success',
          message: `${updatedPlatformName} updated!`,
        })
        setTimeout(() => setSaveFeedback(null), 3000)
      }
    })
  }

  // Disconnect a social platform from modal
  const handleDisconnectModal = () => {
    if (!modalPlatform) return
    let newInstagram = instagram
    let newTiktok = tiktok
    let newYoutube = youtube

    if (modalPlatform === 'instagram') newInstagram = ''
    if (modalPlatform === 'tiktok') newTiktok = ''
    if (modalPlatform === 'youtube') newYoutube = ''

    if (isPublic && !newInstagram && !newTiktok && !newYoutube) {
      setSaveFeedback({
        type: 'error',
        message: 'Cannot disconnect all accounts while public profile is active.',
      })
      setTimeout(() => setSaveFeedback(null), 3500)
      return
    }

    const formData = new FormData()
    formData.append('instagram_url', newInstagram)
    formData.append('tiktok_url', newTiktok)
    formData.append('youtube_url', newYoutube)
    formData.append('bio', bio)

    startSaveTransition(async () => {
      const res = await updateCreatorLinks(formData)
      if (res.error) {
        setSaveFeedback({ type: 'error', message: res.error })
      } else {
        if (modalPlatform === 'instagram') setInstagram('')
        if (modalPlatform === 'tiktok') setTiktok('')
        if (modalPlatform === 'youtube') setYoutube('')
        const platformName = modalPlatform.charAt(0).toUpperCase() + modalPlatform.slice(1)
        setModalPlatform(null)
        setSaveFeedback({
          type: 'success',
          message: `${platformName} disconnected.`,
        })
        setTimeout(() => setSaveFeedback(null), 3000)
      }
    })
  }

  // Save Bio
  const handleSaveBio = () => {
    setSaveFeedback(null)
    const formData = new FormData()
    formData.append('instagram_url', instagram)
    formData.append('tiktok_url', tiktok)
    formData.append('youtube_url', youtube)
    formData.append('bio', bio.trim())

    startSaveTransition(async () => {
      const res = await updateCreatorLinks(formData)
      if (res.error) {
        setSaveFeedback({ type: 'error', message: res.error })
      } else {
        setSaveFeedback({ type: 'success', message: 'Bio updated!' })
        setTimeout(() => setSaveFeedback(null), 3000)
      }
    })
  }

  const socialButtons = [
    {
      id: 'instagram' as const,
      name: 'Instagram',
      url: instagram,
      logo: <InstagramLogo className="h-7 w-7 sm:h-8 sm:w-8 shrink-0" />,
      placeholder: 'your_handle',
    },
    {
      id: 'tiktok' as const,
      name: 'TikTok',
      url: tiktok,
      logo: <TikTokLogo className="h-7 w-7 sm:h-8 sm:w-8 shrink-0" />,
      placeholder: 'your_handle',
    },
    {
      id: 'youtube' as const,
      name: 'YouTube',
      url: youtube,
      logo: <YouTubeLogo className="h-7 w-7 sm:h-8 sm:w-8 shrink-0" />,
      placeholder: 'channel_handle',
    },
  ]

  const currentModalUrl =
    modalPlatform === 'instagram' ? instagram : modalPlatform === 'tiktok' ? tiktok : youtube
  const currentModalConnected = Boolean(currentModalUrl && currentModalUrl.trim())

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-5 text-left">
      {/* Clean Header with Simple Toggle */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-border">
        <h3 className="text-sm sm:text-base font-bold text-foreground">
          Public Profile
        </h3>

        {/* Minimalist Switch */}
        <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
          <span className="text-xs font-medium text-muted-foreground">
            {isPublic ? 'On' : 'Off'}
          </span>
          <div className="relative inline-flex items-center">
            <input
              id="public-profile-toggle"
              type="checkbox"
              checked={isPublic}
              disabled={isToggling}
              onChange={(e) => handleToggle(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-muted-foreground/25 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
          </div>
          {isToggling && <Loader2 className="h-3.5 w-3.5 animate-spin text-[#FC801A]" />}
        </label>
      </div>

      {toggleFeedback && (
        <div
          className={`p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in ${
            toggleFeedback.type === 'error'
              ? 'bg-destructive/10 text-destructive border border-destructive/20'
              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
          }`}
        >
          {toggleFeedback.type === 'error' ? (
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <Check className="h-3.5 w-3.5 shrink-0" />
          )}
          <span>{toggleFeedback.message}</span>
        </div>
      )}

      {/* Social Accounts */}
      <div className="space-y-2.5">
        <span className="text-xs font-semibold text-muted-foreground block">
          Connect Your Social Accounts
        </span>

        {/* Clean row of large circular logo buttons with green-on-connected frame and hover tooltips */}
        <div className="flex items-center gap-3.5 sm:gap-4 flex-wrap">
          {socialButtons.map((platform) => {
            const isConnected = Boolean(platform.url && platform.url.trim())
            const handle = extractHandle(platform.url)

            return (
              <div key={platform.id} className="relative group flex items-center">
                <button
                  type="button"
                  onClick={() => openModal(platform.id)}
                  className={`relative h-13 w-13 sm:h-14 sm:w-14 rounded-full border-2 ${
                    isConnected
                      ? 'border-emerald-500 bg-card hover:bg-emerald-500/10 shadow-2xs shadow-emerald-500/15'
                      : 'border-border/80 dark:border-zinc-700 hover:border-foreground/40 bg-card hover:bg-muted/70 shadow-2xs'
                  } active:scale-95 transition-all flex items-center justify-center cursor-pointer focus-visible:outline-none`}
                  aria-label={`${platform.name}: ${isConnected ? `Connected (${handle})` : 'Not Connected'}`}
                >
                  {platform.logo}
                </button>

                {/* Hover Tooltip (Only appears on hover) */}
                <div className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 flex flex-col items-center min-w-max shadow-lg">
                  <div className="w-2 h-2 -mb-1 rotate-45 bg-popover border-t border-l border-border" />
                  <div className="bg-popover text-popover-foreground text-xs py-1.5 px-3 rounded-xl border border-border shadow-md space-y-0.5 text-center">
                    <div className="font-semibold text-foreground flex items-center justify-center gap-1.5">
                      {platform.id === 'instagram' && <InstagramLogo className="h-3.5 w-3.5" />}
                      {platform.id === 'tiktok' && <TikTokLogo className="h-3.5 w-3.5" />}
                      {platform.id === 'youtube' && <YouTubeLogo className="h-3.5 w-3.5" />}
                      <span>{platform.name}:</span>
                      {isConnected ? (
                        <span className="text-emerald-500 font-bold">Connected</span>
                      ) : (
                        <span className="text-muted-foreground font-bold">Not Connected</span>
                      )}
                    </div>
                    {isConnected ? (
                      <>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          {handle}
                        </div>
                        <div className="text-[10px] text-muted-foreground/80 pt-0.5">
                          Click to edit or disconnect
                        </div>
                      </>
                    ) : (
                      <div className="text-[11px] text-muted-foreground">
                        Click to connect profile
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bio Field */}
      <div className="space-y-2 pt-3 border-t border-border">
        <Label htmlFor="creator-bio" className="text-xs font-semibold text-muted-foreground block">
          Bio & Niche
        </Label>
        <div className="flex items-center gap-2">
          <Input
            id="creator-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveBio()
            }}
            placeholder="Short bio or niche (e.g. Beauty & UGC Creator)"
            className="h-9 text-xs bg-background border-border"
          />
          <Button
            type="button"
            size="sm"
            onClick={handleSaveBio}
            disabled={isSaving}
            className="h-9 px-3.5 text-xs bg-foreground hover:bg-foreground/90 text-background font-medium shrink-0 cursor-pointer"
          >
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Save'}
          </Button>
        </div>
      </div>

      {saveFeedback && (
        <div
          className={`p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in ${
            saveFeedback.type === 'error'
              ? 'bg-destructive/10 text-destructive border border-destructive/20'
              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
          }`}
        >
          {saveFeedback.type === 'error' ? (
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <Check className="h-3.5 w-3.5 shrink-0" />
          )}
          <span>{saveFeedback.message}</span>
        </div>
      )}

      {/* Action Buttons under Bio & Niche */}
      <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setPlanError(null)
            setSwitchPlanModalOpen(true)
          }}
          className="h-9 px-3.5 text-xs font-semibold rounded-xl border border-border/80 hover:border-foreground/30 hover:bg-muted text-foreground cursor-pointer transition-colors shadow-2xs"
        >
          Switch Plan
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setDeleteError(null)
            setDeleteModalOpen(true)
          }}
          className="h-9 px-3.5 text-xs font-semibold rounded-xl border border-destructive/40 text-destructive hover:bg-destructive/10 hover:border-destructive transition-colors cursor-pointer shadow-2xs"
        >
          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
          Delete Account
        </Button>
      </div>

      {/* ===================== POP-UP MODAL FOR ENTERING PROFILE NAME ===================== */}
      {modalPlatform && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div
            className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl space-y-4 text-left animate-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                {modalPlatform === 'instagram' && <InstagramLogo className="h-6 w-6 shrink-0" />}
                {modalPlatform === 'tiktok' && <TikTokLogo className="h-6 w-6 shrink-0" />}
                {modalPlatform === 'youtube' && <YouTubeLogo className="h-6 w-6 shrink-0" />}
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    Connect {modalPlatform.charAt(0).toUpperCase() + modalPlatform.slice(1)}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Display your profile on your public creator card
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalPlatform(null)}
                className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4">
              {/* For YouTube: 1-Click Google OAuth Option + Manual Input */}
              {modalPlatform === 'youtube' && (
                <div className="space-y-3">
                  <a
                    href="/api/auth/google/connect?intent=youtube"
                    className="w-full flex items-center justify-center gap-2.5 h-10 px-4 rounded-xl bg-[#FF0000] hover:bg-[#CC0000] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <YouTubeLogo className="h-4 w-4 shrink-0" />
                    <span>1-Click Connect with Google Account</span>
                  </a>
                  <p className="text-[11px] text-muted-foreground text-center">
                    Uses your Google login to automatically detect your YouTube channel.
                  </p>

                  <div className="relative flex items-center justify-center py-1">
                    <div className="border-t border-border w-full" />
                    <span className="bg-card px-2 text-[10px] text-muted-foreground uppercase tracking-wider relative">
                      or enter channel handle
                    </span>
                  </div>
                </div>
              )}

              {/* Handle Input */}
              <div className="space-y-1.5">
                <Label htmlFor="modal-handle-input" className="text-xs font-semibold text-foreground">
                  {modalPlatform.charAt(0).toUpperCase() + modalPlatform.slice(1)} Username / Handle
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-muted-foreground">@</span>
                  <Input
                    id="modal-handle-input"
                    value={modalHandleInput}
                    onChange={(e) => setModalHandleInput(e.target.value)}
                    placeholder={
                      modalPlatform === 'youtube' ? 'your_channel_handle' : 'your_handle'
                    }
                    className="pl-7 h-9 text-xs bg-background border-border"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveModal()
                      if (e.key === 'Escape') setModalPlatform(null)
                    }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Just enter your handle without the link. We format the full URL automatically.
                </p>
              </div>

              {/* Currently Linked Notice */}
              {currentModalConnected && (
                <div className="p-2.5 rounded-xl bg-muted/40 border border-border text-[11px] flex items-center justify-between">
                  <span className="text-muted-foreground">Currently connected:</span>
                  <a
                    href={currentModalUrl!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-foreground hover:text-[#FC801A] font-medium inline-flex items-center gap-1"
                  >
                    <span>{extractHandle(currentModalUrl)}</span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </a>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-border">
              {currentModalConnected ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleDisconnectModal}
                  disabled={isSaving}
                  className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive cursor-pointer"
                >
                  Disconnect
                </Button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModalPlatform(null)}
                  className="h-8 px-3 text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveModal}
                  disabled={isSaving}
                  className="h-8 px-4 text-xs bg-[#FC801A] hover:bg-[#E66F0D] text-white font-semibold cursor-pointer"
                >
                  {isSaving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== POP-UP MODAL FOR SWITCHING PLAN ===================== */}
      {switchPlanModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div
            className="w-full max-w-md rounded-2xl bg-card border border-border p-5 sm:p-6 shadow-2xl space-y-4 text-left animate-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h4 className="text-sm sm:text-base font-bold text-foreground">
                  Switch Plan
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Select your desired membership tier
                </p>
              </div>

              <button
                type="button"
                onClick={() => !planActionPending && setSwitchPlanModalOpen(false)}
                className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {planError && (
              <div className="p-2.5 rounded-lg text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20 flex items-center gap-2">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{planError}</span>
              </div>
            )}

            {/* Plan Options */}
            <div className="space-y-2.5">
              {/* Free Tier */}
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                  normalizedPlan === 'FREE'
                    ? 'border-border bg-muted/40'
                    : 'border-border hover:border-[#08739C]/40 bg-card'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border border-[#08739C]/40 text-[#08739C] dark:text-[#38BDF8] bg-[#08739C]/5">
                      Free
                    </span>
                    <span className="text-xs font-extrabold text-foreground">
                      $0<span className="text-[10px] font-normal text-muted-foreground">/mo</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Browse verified brand deals & creator codes</p>
                </div>

                {normalizedPlan === 'FREE' ? (
                  <span className="text-[11px] font-semibold text-muted-foreground px-2.5 py-1 rounded-md bg-muted border border-border">
                    Current
                  </span>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={planActionPending}
                    onClick={() => handleSwitchPlan('FREE')}
                    className="h-7 text-xs font-medium rounded-lg border-border hover:bg-muted text-foreground cursor-pointer shrink-0"
                  >
                    {planActionPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Select'}
                  </Button>
                )}
              </div>

              {/* Basic Tier */}
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                  normalizedPlan === 'BASIC'
                    ? 'border-[#FC801A]/40 bg-[#FC801A]/5'
                    : 'border-border hover:border-[#FC801A]/40 bg-card'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border border-[#FC801A]/50 text-[#FC801A] bg-[#FC801A]/5">
                      Basic
                    </span>
                    <span className="text-xs font-extrabold text-foreground">
                      $10<span className="text-[10px] font-normal text-muted-foreground">/mo</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Collabs pipeline & share affiliate links</p>
                </div>

                {normalizedPlan === 'BASIC' ? (
                  <span className="text-[11px] font-semibold text-[#FC801A] px-2.5 py-1 rounded-md bg-[#FC801A]/10 border border-[#FC801A]/20">
                    Current
                  </span>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={planActionPending}
                    onClick={() => handleSwitchPlan('BASIC')}
                    className="h-7 text-xs font-medium rounded-lg border-[#FC801A]/40 text-[#FC801A] hover:bg-[#FC801A]/10 cursor-pointer shrink-0"
                  >
                    {planActionPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Select'}
                  </Button>
                )}
              </div>

              {/* Standard Tier */}
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                  normalizedPlan === 'STANDARD'
                    ? 'border-[#FC801A]/60 bg-[#FC801A]/5 ring-1 ring-[#FC801A]/25'
                    : 'border-border hover:border-[#FC801A]/50 bg-card'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#FC801A] text-white shadow-2xs">
                      Standard
                    </span>
                    <span className="text-xs font-extrabold text-foreground">
                      $15<span className="text-[10px] font-normal text-muted-foreground">/mo</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Public Explore portfolio & connected social links</p>
                </div>

                {normalizedPlan === 'STANDARD' ? (
                  <span className="text-[11px] font-semibold text-[#FC801A] px-2.5 py-1 rounded-md bg-[#FC801A]/10 border border-[#FC801A]/20">
                    Current
                  </span>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    disabled={planActionPending}
                    onClick={() => handleSwitchPlan('STANDARD')}
                    className="h-7 text-xs font-medium rounded-lg bg-[#FC801A] hover:bg-[#E66F0D] text-white cursor-pointer shrink-0 border-0"
                  >
                    {planActionPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Select'}
                  </Button>
                )}
              </div>
            </div>

            {/* Modal Footer link */}
            <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border">
              <Link
                href="/plans"
                onClick={() => setSwitchPlanModalOpen(false)}
                className="hover:text-foreground inline-flex items-center gap-1 transition-colors"
              >
                <span>View full plan breakdown</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSwitchPlanModalOpen(false)}
                className="h-7 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== POP-UP MODAL FOR DELETING ACCOUNT ===================== */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div
            className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl space-y-4 text-left animate-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-base font-bold text-foreground">Delete Account</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Are you sure you want to delete your account? This action is permanent and cannot be undone. All your campaigns, affiliate links, and creator profile will be permanently removed.
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="p-2.5 rounded-lg text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20 flex items-center gap-2">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={deletePending}
                onClick={() => setDeleteModalOpen(false)}
                className="text-xs cursor-pointer text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={deletePending}
                onClick={handleDeleteAccount}
                className="text-xs cursor-pointer"
              >
                {deletePending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    Deleting...
                  </>
                ) : (
                  'Permanently Delete'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
