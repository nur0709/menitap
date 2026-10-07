'use client'

import React, { useState, useTransition } from 'react'
import { setPublicProfileVisibility, updateCreatorLinks } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { InstagramLogo, TikTokLogo, YouTubeLogo } from '@/components/social-icons'
import { Check, Loader2, Sparkles, AlertCircle, X, ExternalLink } from 'lucide-react'

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

export function CreatorPublicProfileManager({ profile }: { profile: CreatorProfileData }) {
  // Public toggle state
  const [isPublic, setIsPublic] = useState(Boolean(profile.is_public_profile))
  const [isToggling, startToggleTransition] = useTransition()
  const [toggleFeedback, setToggleFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null)

  // Current links state
  const [instagram, setInstagram] = useState(profile.instagram_url || '')
  const [tiktok, setTiktok] = useState(profile.tiktok_url || '')
  const [youtube, setYoutube] = useState(profile.youtube_url || '')
  const [bio, setBio] = useState(profile.bio || '')

  // Modal dialog state for clicking a social logo
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
      logo: <InstagramLogo className="h-6 w-6 shrink-0" />,
      placeholder: 'your_handle',
    },
    {
      id: 'tiktok' as const,
      name: 'TikTok',
      url: tiktok,
      logo: <TikTokLogo className="h-6 w-6 shrink-0" />,
      placeholder: 'your_handle',
    },
    {
      id: 'youtube' as const,
      name: 'YouTube',
      url: youtube,
      logo: <YouTubeLogo className="h-6 w-6 shrink-0" />,
      placeholder: 'channel_handle',
    },
  ]

  const currentModalUrl =
    modalPlatform === 'instagram' ? instagram : modalPlatform === 'tiktok' ? tiktok : youtube
  const currentModalConnected = Boolean(currentModalUrl && currentModalUrl.trim())

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-6 text-left">
      {/* Header with Integrated Public Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#FC801A]" />
            <h3 className="text-sm sm:text-base font-bold text-foreground">
              Public Creator Profile & Socials
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Display your portfolio and social handles on Menitap Explore for brand deals.
          </p>
        </div>

        {/* Compact Toggle Pill */}
        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto bg-muted/40 px-3 py-1.5 rounded-xl border border-border">
          <div className="text-right">
            <div className="text-xs font-semibold text-foreground flex items-center justify-end gap-1.5">
              {isPublic ? (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Public</span>
                </>
              ) : (
                <span>Hidden</span>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground block">
              {isPublic ? 'Visible on Explore' : 'Private'}
            </span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              id="public-profile-toggle"
              type="checkbox"
              checked={isPublic}
              disabled={isToggling}
              onChange={(e) => handleToggle(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-5.5 bg-muted-foreground/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-emerald-500" />
          </label>
          {isToggling && <Loader2 className="h-3.5 w-3.5 animate-spin text-[#FC801A]" />}
        </div>
      </div>

      {toggleFeedback && (
        <div
          className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in ${
            toggleFeedback.type === 'error'
              ? 'bg-destructive/10 text-destructive border border-destructive/20'
              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
          }`}
        >
          {toggleFeedback.type === 'error' ? (
            <AlertCircle className="h-4 w-4 shrink-0" />
          ) : (
            <Check className="h-4 w-4 shrink-0" />
          )}
          <span>{toggleFeedback.message}</span>
        </div>
      )}

      {/* ----------------- Social Media Logo Buttons with Indicators ----------------- */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold text-foreground uppercase tracking-wider">
            Connected Social Accounts
          </Label>
          <span className="text-[11px] text-muted-foreground">
            Click logo to connect or edit
          </span>
        </div>

        {/* Compact Logo Buttons + Connected Handles Row */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Logo Buttons Group */}
          <div className="inline-flex items-center gap-1.5 p-1 rounded-2xl bg-muted/40 border border-border shadow-2xs">
            {socialButtons.map((platform) => {
              const isConnected = Boolean(platform.url && platform.url.trim())

              return (
                <div key={platform.id} className="relative group flex items-center">
                  <button
                    type="button"
                    onClick={() => openModal(platform.id)}
                    className="relative h-9 w-9 rounded-xl hover:bg-background/90 active:scale-95 transition-all flex items-center justify-center cursor-pointer focus-visible:outline-none"
                    aria-label={`${platform.name}: ${isConnected ? 'Connected' : 'Not Connected'}`}
                  >
                    {platform.logo}

                    {/* Status Indicator Dot */}
                    {isConnected ? (
                      <span className="absolute top-0.5 right-0.5 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-background" />
                      </span>
                    ) : (
                      <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-500 border border-background" />
                    )}
                  </button>

                  {/* Hover Tooltip (Only visible on hover) */}
                  <div className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 flex flex-col items-center min-w-max shadow-lg">
                    <div className="w-2 h-2 -mb-1 rotate-45 bg-popover border-t border-l border-border" />
                    <div className="bg-popover text-popover-foreground text-xs py-1.5 px-3 rounded-xl border border-border shadow-md space-y-0.5 text-center">
                      <div className="font-semibold text-foreground flex items-center justify-center gap-1.5">
                        <span>
                          {platform.name}: {isConnected ? 'Connected' : 'Not Connected'}
                        </span>
                      </div>
                      {isConnected ? (
                        <>
                          <div className="text-[11px] text-muted-foreground font-mono">
                            {extractHandle(platform.url)}
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

          {/* Connected Handles Quick Pills (Visible Links) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {instagram && (
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-card border border-border text-[11px] font-mono text-foreground hover:text-[#FC801A] transition-colors shadow-2xs group"
                title="Open Instagram Profile"
              >
                <InstagramLogo className="h-3.5 w-3.5 shrink-0" />
                <span>{extractHandle(instagram)}</span>
                <ExternalLink className="h-2.5 w-2.5 text-muted-foreground group-hover:text-[#FC801A]" />
              </a>
            )}
            {tiktok && (
              <a
                href={tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-card border border-border text-[11px] font-mono text-foreground hover:text-[#FC801A] transition-colors shadow-2xs group"
                title="Open TikTok Profile"
              >
                <TikTokLogo className="h-3.5 w-3.5 shrink-0" />
                <span>{extractHandle(tiktok)}</span>
                <ExternalLink className="h-2.5 w-2.5 text-muted-foreground group-hover:text-[#FC801A]" />
              </a>
            )}
            {youtube && (
              <a
                href={youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-card border border-border text-[11px] font-mono text-foreground hover:text-[#FC801A] transition-colors shadow-2xs group"
                title="Open YouTube Channel"
              >
                <YouTubeLogo className="h-3.5 w-3.5 shrink-0" />
                <span>{extractHandle(youtube)}</span>
                <ExternalLink className="h-2.5 w-2.5 text-muted-foreground group-hover:text-[#FC801A]" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Bio Field */}
      <div className="space-y-2 pt-2 border-t border-border">
        <div className="flex items-center justify-between">
          <Label htmlFor="creator-bio" className="text-xs font-semibold text-foreground">
            Creator Bio / Niche
          </Label>
          <span className="text-[11px] text-muted-foreground">
            Appears on your Explore card
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Input
            id="creator-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="e.g. Beauty & Skincare UGC Creator based in NY"
            className="h-9 text-xs bg-background border-border"
          />
          <Button
            type="button"
            size="sm"
            onClick={handleSaveBio}
            disabled={isSaving}
            className="h-9 px-3.5 text-xs bg-[#FC801A] hover:bg-[#E66F0D] text-white shrink-0 cursor-pointer"
          >
            {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save Bio'}
          </Button>
        </div>
      </div>

      {saveFeedback && (
        <div
          className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in ${
            saveFeedback.type === 'error'
              ? 'bg-destructive/10 text-destructive border border-destructive/20'
              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
          }`}
        >
          {saveFeedback.type === 'error' ? (
            <AlertCircle className="h-4 w-4 shrink-0" />
          ) : (
            <Check className="h-4 w-4 shrink-0" />
          )}
          <span>{saveFeedback.message}</span>
        </div>
      )}

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
    </div>
  )
}
