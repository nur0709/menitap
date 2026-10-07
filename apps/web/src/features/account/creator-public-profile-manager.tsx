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
          message: `${platform.charAt(0).toUpperCase() + platform.slice(1)} updated successfully!`,
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
        message: 'Cannot disconnect all accounts while your public profile is active.',
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

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-6 text-left">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#FC801A]" />
          <h3 className="text-sm sm:text-base font-bold text-foreground">
            Public Creator Profile & Socials
          </h3>
        </div>

        {/* Live Status Badge */}
        <div className="shrink-0">
          {isPublic ? (
            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs flex items-center gap-1.5 py-1 px-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Public on Explore
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-muted text-muted-foreground text-xs py-1 px-2.5">
              Profile Hidden
            </Badge>
          )}
        </div>
      </div>

      {/* Enable Public Toggle */}
      <div className="p-3.5 rounded-xl bg-muted/30 border border-border flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Label
              htmlFor="public-profile-toggle"
              className="text-xs sm:text-sm font-semibold text-foreground cursor-pointer"
            >
              Show Profile in Explore Creators
            </Label>
            {isToggling && <Loader2 className="h-3 w-3 animate-spin text-[#FC801A]" />}
          </div>
          <p className="text-[11px] sm:text-xs text-muted-foreground">
            {isPublic
              ? 'Your portfolio and connected social links are visible to brands searching for UGC creators.'
              : 'Hidden: Brands cannot discover your profile until enabled.'}
          </p>
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
          <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FC801A]" />
        </label>
      </div>

      {toggleFeedback && (
        <div
          className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
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

      {/* ----------------- Social Media Connect Buttons ----------------- */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold text-foreground uppercase tracking-wider">
            Connected Social Accounts
          </Label>
          <span className="text-[11px] text-muted-foreground">
            Official 1-click connect
          </span>
        </div>

        {/* 1. Instagram */}
        <div className="p-3.5 rounded-xl border border-border bg-card/70 flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <InstagramLogo className="h-6 w-6 shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-foreground">Instagram</span>
                  {instagram && (
                    <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  )}
                </div>
                <div className="text-[11px] text-muted-foreground truncate">
                  {instagram ? (
                    <a
                      href={instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-foreground hover:underline inline-flex items-center gap-1"
                    >
                      <span>{extractHandle(instagram)}</span>
                      <ExternalLink className="h-2.5 w-2.5 text-muted-foreground" />
                    </a>
                  ) : (
                    'Not connected'
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {instagram ? (
                <>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => startEditing('instagram')}
                    className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDisconnectSocial('instagram')}
                    disabled={isSaving}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => startEditing('instagram')}
                  className="h-8 px-3 rounded-xl bg-gradient-to-r from-[#d6249f] to-[#fd5949] hover:opacity-90 text-white font-semibold text-xs border-0 shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Connect Instagram</span>
                </Button>
              )}
            </div>
          </div>

          {editingPlatform === 'instagram' && (
            <div className="pt-2 border-t border-border flex items-center gap-2 animate-in fade-in">
              <div className="relative flex-1">
                <span className="absolute left-3 top-2 text-xs text-muted-foreground">@</span>
                <Input
                  value={handleInput}
                  onChange={(e) => setHandleInput(e.target.value)}
                  placeholder="your_handle"
                  className="pl-7 h-8 text-xs bg-background border-border"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveSocial('instagram')
                    if (e.key === 'Escape') setEditingPlatform(null)
                  }}
                />
              </div>
              <Button
                type="button"
                size="sm"
                onClick={() => handleSaveSocial('instagram')}
                disabled={isSaving}
                className="h-8 px-3 text-xs bg-[#FC801A] hover:bg-[#E66F0D] text-white cursor-pointer"
              >
                {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save'}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setEditingPlatform(null)}
                className="h-8 px-2 text-xs text-muted-foreground cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* 2. TikTok */}
        <div className="p-3.5 rounded-xl border border-border bg-card/70 flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <TikTokLogo className="h-6 w-6 shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-foreground">TikTok</span>
                  {tiktok && (
                    <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  )}
                </div>
                <div className="text-[11px] text-muted-foreground truncate">
                  {tiktok ? (
                    <a
                      href={tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-foreground hover:underline inline-flex items-center gap-1"
                    >
                      <span>{extractHandle(tiktok)}</span>
                      <ExternalLink className="h-2.5 w-2.5 text-muted-foreground" />
                    </a>
                  ) : (
                    'Not connected'
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {tiktok ? (
                <>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => startEditing('tiktok')}
                    className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDisconnectSocial('tiktok')}
                    disabled={isSaving}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => startEditing('tiktok')}
                  className="h-8 px-3 rounded-xl bg-black hover:bg-zinc-800 text-white font-semibold text-xs border border-zinc-700 shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Connect TikTok</span>
                </Button>
              )}
            </div>
          </div>

          {editingPlatform === 'tiktok' && (
            <div className="pt-2 border-t border-border flex items-center gap-2 animate-in fade-in">
              <div className="relative flex-1">
                <span className="absolute left-3 top-2 text-xs text-muted-foreground">@</span>
                <Input
                  value={handleInput}
                  onChange={(e) => setHandleInput(e.target.value)}
                  placeholder="your_handle"
                  className="pl-7 h-8 text-xs bg-background border-border"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveSocial('tiktok')
                    if (e.key === 'Escape') setEditingPlatform(null)
                  }}
                />
              </div>
              <Button
                type="button"
                size="sm"
                onClick={() => handleSaveSocial('tiktok')}
                disabled={isSaving}
                className="h-8 px-3 text-xs bg-[#FC801A] hover:bg-[#E66F0D] text-white cursor-pointer"
              >
                {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save'}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setEditingPlatform(null)}
                className="h-8 px-2 text-xs text-muted-foreground cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* 3. YouTube */}
        <div className="p-3.5 rounded-xl border border-border bg-card/70 flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <YouTubeLogo className="h-6 w-6 shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-foreground">YouTube</span>
                  {youtube && (
                    <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  )}
                </div>
                <div className="text-[11px] text-muted-foreground truncate">
                  {youtube ? (
                    <a
                      href={youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-foreground hover:underline inline-flex items-center gap-1"
                    >
                      <span>{extractHandle(youtube)}</span>
                      <ExternalLink className="h-2.5 w-2.5 text-muted-foreground" />
                    </a>
                  ) : (
                    'Not connected'
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {youtube ? (
                <>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => startEditing('youtube')}
                    className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDisconnectSocial('youtube')}
                    disabled={isSaving}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => startEditing('youtube')}
                  className="h-8 px-3 rounded-xl bg-[#FF0000] hover:bg-[#CC0000] text-white font-semibold text-xs border-0 shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Connect YouTube</span>
                </Button>
              )}
            </div>
          </div>

          {editingPlatform === 'youtube' && (
            <div className="pt-2 border-t border-border flex items-center gap-2 animate-in fade-in">
              <div className="relative flex-1">
                <span className="absolute left-3 top-2 text-xs text-muted-foreground">@</span>
                <Input
                  value={handleInput}
                  onChange={(e) => setHandleInput(e.target.value)}
                  placeholder="your_channel_handle"
                  className="pl-7 h-8 text-xs bg-background border-border"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveSocial('youtube')
                    if (e.key === 'Escape') setEditingPlatform(null)
                  }}
                />
              </div>
              <Button
                type="button"
                size="sm"
                onClick={() => handleSaveSocial('youtube')}
                disabled={isSaving}
                className="h-8 px-3 text-xs bg-[#FC801A] hover:bg-[#E66F0D] text-white cursor-pointer"
              >
                {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save'}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setEditingPlatform(null)}
                className="h-8 px-2 text-xs text-muted-foreground cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          )}
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
