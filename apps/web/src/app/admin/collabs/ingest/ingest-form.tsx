'use client'

import { useState } from 'react'
import { ingestNewsletterDigestAction } from '@/features/links/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle2, Loader2, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const SAMPLE_NEWSLETTER = `Brands Meet Creators - Weekly Creator Casting Digest

Brand: Summer Fridays
Product: Jet Lag Mask & Lip Butter Balm Duo
Compensation: $350 USD + Free Skincare Bundle ($98 value)
Deliverables: 1x TikTok GRWM Video (30-60s) + 2x High-Res In-Feed Photos
Requirements: US/Canada beauty & skincare creators, >3k followers, aesthetic vanity setup
Deadline: 2026-11-15
Application Form: https://airtable.com/appSummerFridays/shrCasting2026
Brief Description: Looking for creators to showcase hydration and morning skincare routine using Summer Fridays bestseller duo.

Brand: Anker Soundcore
Product: Space One Pro Noise-Cancelling Headphones
Compensation: $400 USD + Complimentary Headphones ($199 value)
Deliverables: 1x TikTok / Reel Commute Routine Showcase + 1x Raw Video Cut
Requirements: Tech, lifestyle, or student creators with clean audio/lighting
Deadline: 2026-11-20
Application Form: https://forms.gle/SoundcoreProCasting2026
Brief Description: Authentic day-in-the-life testing of adaptive active noise cancellation during daily commute and study sessions.

Brand: Dagne Dover
Product: Landon Carryall & Ace Fanny Pack Set
Compensation: Free Product Set ($255 value) + 15% Affiliate Commission
Deliverables: 1x Travel Packing or Workout Essentials Reel
Requirements: Lifestyle, fitness, travel, or mom creators
Deadline: 2026-11-18
Application Form: https://form.typeform.com/to/DagneDoverTravelCollab
Brief Description: Feature water-resistant neoprene bags in a stylish travel or gym essentials flatlay and try-on video.`

export function IngestForm() {
  const [sender, setSender] = useState('Brands Meet Creators')
  const [subject, setSubject] = useState('Weekly UGC & Creator Casting Calls Digest')
  const [rawText, setRawText] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
    ingestedCount?: number
    skippedCount?: number
    errors?: string[]
  }>({ type: null, message: '' })

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rawText.trim()) return

    setLoading(true)
    setStatus({ type: null, message: '' })

    try {
      const res = await ingestNewsletterDigestAction({
        sender,
        subject,
        rawText,
      })

      if (res.success) {
        setStatus({
          type: 'success',
          message: res.message,
          ingestedCount: res.ingestedCount,
          skippedCount: res.skippedCount,
          errors: res.errors,
        })
      } else {
        setStatus({
          type: 'error',
          message: res.message,
          errors: res.errors,
        })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to ingest newsletter'
      setStatus({ type: 'error', message: msg })
    } finally {
      setLoading(false)
    }
  }

  const loadSample = () => {
    setSender('Brands Meet Creators')
    setSubject('Weekly UGC & Creator Casting Calls Digest')
    setRawText(SAMPLE_NEWSLETTER)
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Paste Newsletter or Casting Digest</CardTitle>
              <CardDescription className="text-xs text-muted-foreground pt-1">
                Paste the raw text or email body from Brands Meet Creators, UGC Club, or agency casting calls. The AI parser will extract the brand, exact product, compensation, deliverables, and verify intake form links.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={loadSample}
              className="text-xs h-8 gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#08739C]" />
              Load Sample Digest
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleIngest} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="sender" className="text-xs font-semibold">
                  Sender / Community Name
                </Label>
                <Input
                  id="sender"
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  placeholder="e.g. Brands Meet Creators"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="subject" className="text-xs font-semibold">
                  Email Subject / Campaign Title
                </Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Weekly Creator Casting Calls"
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rawText" className="text-xs font-semibold">
                Newsletter Body / Content
              </Label>
              <textarea
                id="rawText"
                rows={12}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste the newsletter content here... Include brands, compensation, and application form links (Airtable, Typeform, Google Forms, etc.)."
                className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-xs font-mono transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 text-foreground"
                required
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-[11px] text-muted-foreground">
                Only briefs with direct application intake forms will be inserted. General store homepages and affiliate networks are automatically rejected.
              </p>

              <Button
                type="submit"
                disabled={loading || !rawText.trim()}
                className="bg-[#08739C] hover:bg-[#02547A] text-white text-xs px-4 h-9 gap-1.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Parsing & Ingesting...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    Parse & Ingest Briefs
                  </>
                )}
              </Button>
            </div>
          </form>

          {status.type && (
            <div
              className={`mt-6 p-4 rounded-xl border flex items-start gap-3 ${
                status.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                  : 'bg-destructive/10 border-destructive/30 text-destructive dark:text-destructive'
              }`}
            >
              {status.type === 'success' ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              )}
              <div className="flex-1 text-xs space-y-1">
                <p className="font-semibold text-sm">{status.message}</p>
                {status.errors && status.errors.length > 0 && (
                  <ul className="list-disc pl-4 space-y-0.5 pt-1 text-muted-foreground">
                    {status.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                )}
                {status.type === 'success' && (
                  <div className="pt-2">
                    <Link
                      href="/collabs"
                      className="inline-flex items-center gap-1 font-semibold text-[#08739C] dark:text-[#38BDF8] hover:underline"
                    >
                      <span>View Live Brand Collabs</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
