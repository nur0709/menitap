'use client'

import React, { useState, useTransition } from 'react'
import { setPublicProfileVisibility, updateCreatorLinks } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { InstagramLogo, TikTokLogo, YouTubeLogo } from '@/components/social-icons'
import { Check, Loader2, Sparkles, AlertCircle, Edit2, X, Plus, ExternalLink } from 'lucide-react'

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

  // Inline editing state for each social
  const [editingPlatform, setEditingPlatform] = useState<'instagram' | 'tiktok' | 'youtube' | null>(null)
  const [handleInput, setHandleInput] = useState('')

  const [isSaving, startSaveTransition] = useTransition()
  const [saveFeedback, setSaveFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null)

  const hasAnyLink = Boolean(instagram.trim() || tiktok.trim() || youtube.trim())

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

  // Open inline connect/edit input
  const startEditing = (platform: 'instagram' | 'tiktok' | 'youtube') => {
    const currentUrl = platform === 'instagram' ? instagram : platform === 'tiktok' ? tiktok : youtube
    setHandleInput(extractHandle(currentUrl).replace(/^@/, ''))
    setEditingPlatform(platform)
  }

  // Save a social platform handle
  const handleSaveSocial = (platform: 'instagram' | 'tiktok' | 'youtube') => {
    setSaveFeedback(null)
    const newUrl = formatSocialUrl(handleInput, platform)

    let newInstagram = instagram
    let newTiktok = tiktok
    let newYoutube = youtube

    if (platform === 'instagram') newInstagram = newUrl
    if (platform === 'tiktok') newTiktok = newUrl
    if (platform === 'youtube') newYoutube = newUrl

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
        if (platform === 'instagram') setInstagram(newInstagram)
        if (platform === 'tiktok') setTiktok(newTiktok)
        if (platform === 'youtube') setYoutube(newYoutube)
        setEditingPlatform(null)
        setSaveFeedback({
          type: 'success',
          message: `${platform.charAt(0).toUpperCase() + platform.slice(1)} updated!`,
        })
        setTimeout(() => setSaveFeedback(null), 3000)
      }
    })
  }

  // Disconnect a social platform
  const handleDisconnectSocial = (platform: 'instagram' | 'tiktok' | 'youtube') => {
    let newInstagram = instagram
    let newTiktok = tiktok
    let newYoutube = youtube

    if (platform === 'instagram') newInstagram = ''
    if (platform === 'tiktok') newTiktok = ''
    if (platform === 'youtube') newYoutube = ''

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
        if (platform === 'instagram') setInstagram('')
        if (platform === 'tiktok') setTiktok('')
        if (platform === 'youtube') setYoutube('')
        setSaveFeedback({
          type: 'success',
          message: `${platform.charAt(0).toUpperCase() + platform.slice(1)} disconnected.`,
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

  const socialPlatforms = [
    {
      id: 'instagram' as const,
      name: 'Instagram',
      url: instagram,
      logo: <InstagramLogo className="h-5 w-5 shrink-0" />,
      placeholder: 'your_handle',
      connectClass: 'bg-gradient-to-r from-[#d6249f] to-[#fd5949] text-white hover:opacity-90',
    },
    {
      id: 'tiktok' as const,
      name: 'TikTok',
      url: tiktok,
      logo: <TikTokLogo className="h-5 w-5 shrink-0" />,
      placeholder: 'your_handle',
      connectClass: 'bg-black dark:bg-zinc-800 text-white hover:bg-zinc-900 border border-zinc-700/60',
    },
    {
      id: 'youtube' as const,
      name: 'YouTube',
      url: youtube,
      logo: <YouTubeLogo className="h-5 w-5 shrink-0" />,
      placeholder: 'channel_handle',
      connectClass: 'bg-[#FF0000] hover:bg-[#CC0000] text-white',
    },
  ]

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-6 text-left">
      {/* Header with Integrated Public Toggle (Tight, Cohesive, No Giant Empty Bar) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#FC801A]" />
            <h3 className="text-sm sm:text-base font-bold text-foreground">
              Public Creator Profile
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

      {/* ----------------- Social Media 3-Card Grid ----------------- */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold text-foreground uppercase tracking-wider">
            Connected Social Accounts
          </Label>
          <span className="text-[11px] text-muted-foreground">
            Shown on your public creator card
          </span>
        </div>

        {/* 3-Column Card Grid (Tight, Modern, Zero Void Gaps) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {socialPlatforms.map((platform) => {
            const isConnected = Boolean(platform.url && platform.url.trim())
            const isEditing = editingPlatform === platform.id

            return (
              <div
                key={platform.id}
                className="flex flex-col justify-between p-3.5 rounded-xl border border-border bg-card/60 hover:bg-card/90 transition-all shadow-2xs min-h-[148px]"
              >
                {/* Card Top: Logo, Name & Badge */}
                <div>
                  <div className="flex items-center justify-between gap-1.5 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {platform.logo}
                      <span className="text-xs font-bold text-foreground truncate">
                        {platform.name}
                      </span>
                    </div>

                    {isConnected ? (
                      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 text-[10px] px-1.5 py-0.5 font-medium shrink-0 flex items-center gap-1">
                        <Check className="h-2.5 w-2.5" />
                        <span>Linked</span>
                      </Badge>
                    ) : (
                      <span className="text-[10px] text-muted-foreground font-medium shrink-0">
                        Unlinked
                      </span>
                    )}
                  </div>

                  {/* Card Middle: Handle display or Inline Edit */}
                  {isEditing ? (
                    <div className="space-y-2 my-2">
                      <div className="relative">
                        <span className="absolute left-2.5 top-2 text-xs text-muted-foreground">@</span>
                        <Input
                          value={handleInput}
                          onChange={(e) => setHandleInput(e.target.value)}
                          placeholder={platform.placeholder}
                          className="pl-6 h-8 text-xs bg-background border-border"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveSocial(platform.id)
                            if (e.key === 'Escape') setEditingPlatform(null)
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleSaveSocial(platform.id)}
                          disabled={isSaving}
                          className="h-7 flex-1 text-xs bg-[#FC801A] hover:bg-[#E66F0D] text-white font-medium cursor-pointer"
                        >
                          {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save'}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingPlatform(null)}
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="my-2 min-h-[26px] flex items-center">
                      {isConnected ? (
                        <a
                          href={platform.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-mono font-medium text-foreground hover:text-[#FC801A] transition-colors inline-flex items-center gap-1 truncate max-w-full group"
                        >
                          <span className="truncate">{extractHandle(platform.url)}</span>
                          <ExternalLink className="h-2.5 w-2.5 text-muted-foreground group-hover:text-[#FC801A] shrink-0" />
                        </a>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">
                          Not connected yet
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer: Action Buttons (Only when not editing) */}
                {!isEditing && (
                  <div className="pt-2 border-t border-border/50">
                    {isConnected ? (
                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => startEditing(platform.id)}
                          className="h-7 flex-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer shadow-2xs"
                        >
                          <Edit2 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDisconnectSocial(platform.id)}
                          disabled={isSaving}
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive cursor-pointer"
                          title={`Disconnect ${platform.name}`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => startEditing(platform.id)}
                        className={`w-full h-7.5 rounded-lg font-semibold text-xs shadow-2xs cursor-pointer flex items-center justify-center gap-1.5 transition-all ${platform.connectClass}`}
                      >
                        <Plus className="h-3 w-3" />
                        <span>Connect</span>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
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
    </div>
  )
}
