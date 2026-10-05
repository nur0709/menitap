'use client'

import { useState, useTransition } from 'react'
import { setPublicProfileVisibility, updateCreatorLinks } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Check, Loader2, Sparkles, AlertCircle } from 'lucide-react'

interface CreatorProfileData {
  is_public_profile?: boolean | null
  instagram_url?: string | null
  tiktok_url?: string | null
  youtube_url?: string | null
  bio?: string | null
}

export function CreatorPublicProfileManager({ profile }: { profile: CreatorProfileData }) {
  // Public toggle state (independently saved directly upon toggle)
  const [isPublic, setIsPublic] = useState(Boolean(profile.is_public_profile))
  const [isToggling, startToggleTransition] = useTransition()
  const [toggleFeedback, setToggleFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null)

  // Links & Bio state (managed by the Save Changes button)
  const initialInstagram = profile.instagram_url || ''
  const initialTiktok = profile.tiktok_url || ''
  const initialYoutube = profile.youtube_url || ''
  const initialBio = profile.bio || ''

  const [instagram, setInstagram] = useState(initialInstagram)
  const [tiktok, setTiktok] = useState(initialTiktok)
  const [youtube, setYoutube] = useState(initialYoutube)
  const [bio, setBio] = useState(initialBio)

  // Saved baseline for links
  const [savedLinksBaseline, setSavedLinksBaseline] = useState({
    instagram: initialInstagram,
    tiktok: initialTiktok,
    youtube: initialYoutube,
    bio: initialBio,
  })

  const [isSaving, startSaveTransition] = useTransition()
  const [saveFeedback, setSaveFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null)
  const [justSaved, setJustSaved] = useState(false)

  // Dirty state strictly applies to links and bio modifications
  const isLinksDirty =
    instagram.trim() !== savedLinksBaseline.instagram.trim() ||
    tiktok.trim() !== savedLinksBaseline.tiktok.trim() ||
    youtube.trim() !== savedLinksBaseline.youtube.trim() ||
    bio.trim() !== savedLinksBaseline.bio.trim()

  const hasAnyLink = Boolean(
    instagram.trim() ||
    tiktok.trim() ||
    youtube.trim() ||
    savedLinksBaseline.instagram.trim() ||
    savedLinksBaseline.tiktok.trim() ||
    savedLinksBaseline.youtube.trim()
  )

  // 1. Independent Toggle Handler: immediately toggles public visibility
  const handleToggle = (newCheckedState: boolean) => {
    setToggleFeedback(null)

    if (newCheckedState && !hasAnyLink) {
      setToggleFeedback({
        type: 'error',
        message: 'Please provide and save at least one social media link before enabling your public profile.',
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

  // 2. Links Save Handler: saves added/modified links & bio
  const handleSaveLinks = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaveFeedback(null)

    const formData = new FormData()
    formData.append('instagram_url', instagram.trim())
    formData.append('tiktok_url', tiktok.trim())
    formData.append('youtube_url', youtube.trim())
    formData.append('bio', bio.trim())

    startSaveTransition(async () => {
      const res = await updateCreatorLinks(formData)
      if (res.error) {
        setSaveFeedback({ type: 'error', message: res.error })
      } else {
        setSavedLinksBaseline({
          instagram,
          tiktok,
          youtube,
          bio,
        })
        setJustSaved(true)
        setSaveFeedback({
          type: 'success',
          message: res.success || 'Links saved successfully!',
        })
        setTimeout(() => setJustSaved(false), 3000)
        setTimeout(() => setSaveFeedback(null), 4000)
      }
    })
  }

  return (
    <div className="w-full pt-6 border-t border-border mt-6 text-left">
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#FC801A]" />
            <h3 className="text-sm sm:text-base font-bold text-foreground">
              Public Creator Profile & Portfolio
            </h3>
          </div>

          {/* Live Status Badge */}
          <div className="shrink-0">
            {isPublic ? (
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs flex items-center gap-1.5 py-1 px-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Profile Active
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-muted text-muted-foreground text-xs py-1 px-2.5">
                Profile Hidden
              </Badge>
            )}
          </div>
        </div>

        {/* Independent Toggle Switch */}
        <div className="p-3.5 rounded-xl bg-muted/30 border border-border flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Label
                htmlFor="public-profile-toggle"
                className="text-xs sm:text-sm font-semibold text-foreground cursor-pointer"
              >
                Enable Public Profile
              </Label>
              {isToggling && <Loader2 className="h-3 w-3 animate-spin text-[#FC801A]" />}
            </div>
            <p className="text-[11px] sm:text-xs text-muted-foreground">
              {isPublic
                ? 'Your profile is active and discoverable on Explore Creators.'
                : 'Disabled: Your inputs remain saved securely, but your profile is hidden from brands.'}
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

        {/* Social Links Form (Uses Save Button Only) */}
        <form onSubmit={handleSaveLinks} className="space-y-4 pt-1">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-foreground uppercase tracking-wider">
                Social Media Links
              </Label>
              <span className="text-[11px] text-muted-foreground">
                Instagram, TikTok, or YouTube
              </span>
            </div>

            {/* Instagram */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </div>
              <Input
                value={instagram}
                onChange={(e) => {
                  setInstagram(e.target.value)
                  setJustSaved(false)
                }}
                placeholder="https://instagram.com/yourhandle"
                className="pl-9 h-9 text-xs bg-background border-border"
              />
            </div>

            {/* TikTok */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.84-4.49V8.75a8.16 8.16 0 0 0 4.93 1.64V6.93a4.85 4.85 0 0 1-1-.24z"/>
                </svg>
              </div>
              <Input
                value={tiktok}
                onChange={(e) => {
                  setTiktok(e.target.value)
                  setJustSaved(false)
                }}
                placeholder="https://tiktok.com/@yourhandle"
                className="pl-9 h-9 text-xs bg-background border-border"
              />
            </div>

            {/* YouTube */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>
              <Input
                value={youtube}
                onChange={(e) => {
                  setYoutube(e.target.value)
                  setJustSaved(false)
                }}
                placeholder="https://youtube.com/@yourchannel"
                className="pl-9 h-9 text-xs bg-background border-border"
              />
            </div>
          </div>

          {/* Bio / Niche note */}
          <div className="space-y-1.5 pt-1">
            <Label htmlFor="bio" className="text-xs font-semibold text-foreground">
              Creator Bio / Niche (Optional)
            </Label>
            <Input
              id="bio"
              value={bio}
              onChange={(e) => {
                setBio(e.target.value)
                setJustSaved(false)
              }}
              placeholder="e.g. Beauty & Tech UGC Creator based in NY"
              className="h-9 text-xs bg-background border-border"
            />
          </div>

          {saveFeedback && (
            <div
              className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
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

          {/* Save Button (Strictly for added/modified links and bio) */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <div>
              {isLinksDirty && !justSaved && (
                <span className="text-[11px] text-[#FC801A] font-medium flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FC801A] animate-ping" />
                  Unsaved changes to your links
                </span>
              )}
              {justSaved && (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                  <Check className="h-3 w-3" />
                  Links saved
                </span>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSaving || !isLinksDirty}
              size="sm"
              className={
                justSaved
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white border-0 font-medium text-xs px-5 h-9 transition-all cursor-default"
                  : isLinksDirty
                  ? "bg-[#FC801A] hover:bg-[#E66F0D] text-white border-0 font-medium text-xs px-5 h-9 cursor-pointer shadow-sm transition-all"
                  : "bg-muted text-muted-foreground border-border hover:bg-muted font-medium text-xs px-5 h-9 cursor-not-allowed opacity-60 transition-all"
              }
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Saving...
                </>
              ) : justSaved ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                  Saved!
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                  {isLinksDirty ? 'Save Changes' : 'Saved'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
