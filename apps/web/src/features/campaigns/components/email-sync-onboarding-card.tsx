'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Copy,
  Check,
  ExternalLink,
  Mail,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  PlayCircle,
  ListOrdered,
} from 'lucide-react'

interface EmailSyncOnboardingCardProps {
  inboundToken: string | null
}

export function EmailSyncOnboardingCard({ inboundToken }: EmailSyncOnboardingCardProps) {
  const [copied, setCopied] = useState(false)
  const [activeView, setActiveView] = useState<'visual' | 'checklist'>('visual')
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1)

  const forwardAddress = inboundToken
    ? `deals+${inboundToken}@in.menitap.com`
    : 'deals@in.menitap.com'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(forwardAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
    }
  }

  return (
    <Card className="bg-card border-border shadow-xs rounded-2xl overflow-hidden text-left">
      {/* Header */}
      <CardHeader className="bg-gradient-to-r from-[#FC801A]/10 via-[#08739C]/10 to-transparent border-b border-border p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-[#FC801A]">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Set it and forget it</span>
          </div>

          {/* Toggle between Visual Demo & Checklist */}
          <div className="flex items-center gap-1 p-1 bg-background/80 rounded-xl border border-border text-xs">
            <button
              onClick={() => setActiveView('visual')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                activeView === 'visual'
                  ? 'bg-[#FC801A] text-white shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <PlayCircle className="h-3.5 w-3.5" />
              <span>Visual Guide</span>
            </button>
            <button
              onClick={() => setActiveView('checklist')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                activeView === 'checklist'
                  ? 'bg-[#FC801A] text-white shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ListOrdered className="h-3.5 w-3.5" />
              <span>Quick Checklist</span>
            </button>
          </div>
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-foreground mt-2">
          Put Your Brand Deals on Autopilot
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl leading-relaxed">
          Whenever a brand emails your normal Gmail with a collab offer, product, or brief, Menitap
          magically turns it into a deal card on your board. You only connect it once!
        </p>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-6">
        {/* Copy Address Box - Always visible & prominent */}
        <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-[#08739C] dark:text-[#38BDF8]" />
              Your Private Menitap Deal Address:
            </span>
            <span className="text-[11px] text-muted-foreground font-medium">Click to copy</span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex-1 bg-background border border-border px-3.5 py-2.5 rounded-xl font-mono text-xs sm:text-sm text-foreground select-all break-all flex items-center gap-2 shadow-xs">
              <span className="text-[#FC801A] font-bold">✉</span>
              <span className="font-semibold">{forwardAddress}</span>
            </div>

            <Button
              type="button"
              onClick={handleCopy}
              className={`h-10 px-5 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs shrink-0 ${
                copied
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-[#FC801A] hover:bg-[#E66F0D] text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1.5" />
                  Copied to Clipboard!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1.5" />
                  Copy Address
                </>
              )}
            </Button>
          </div>
        </div>

        {/* VIEW 1: Interactive Animated Visual Guide */}
        {activeView === 'visual' && (
          <div className="space-y-4">
            {/* Step navigation dots */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-xs font-bold text-foreground">
                How to set it up in Gmail (3 easy steps):
              </span>
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((step) => (
                  <button
                    key={step}
                    onClick={() => setActiveStep(step as 1 | 2 | 3)}
                    className={`h-7 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeStep === step
                        ? 'bg-foreground text-background shadow-xs'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Step {step}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Gmail Mockup Screen */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
              {/* Fake Browser Toolbar */}
              <div className="bg-muted/70 px-4 py-2 border-b border-border flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400 inline-block" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400 inline-block" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 inline-block" />
                  <span className="ml-2 font-mono text-[11px] truncate hidden sm:inline">
                    mail.google.com/settings/forwarding
                  </span>
                </div>
                <span className="text-[10px] font-semibold bg-background px-2 py-0.5 rounded-md border border-border">
                  Step {activeStep} of 3
                </span>
              </div>

              {/* Step 1 Visual */}
              {activeStep === 1 && (
                <div className="p-6 sm:p-8 text-center space-y-4 animate-in fade-in duration-200">
                  <div className="mx-auto h-12 w-12 rounded-2xl bg-[#FC801A]/10 text-[#FC801A] flex items-center justify-center font-bold text-xl">
                    1
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-foreground">
                      Click the button above to copy your private address
                    </h4>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
                      Each creator gets a unique deal address so Menitap knows which cards belong to
                      you.
                    </p>
                  </div>
                  <div className="pt-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        handleCopy()
                        setActiveStep(2)
                      }}
                      className="bg-[#FC801A] hover:bg-[#E66F0D] text-white text-xs font-semibold rounded-xl h-9 px-4 cursor-pointer"
                    >
                      <span>Copy Address & Go to Step 2</span>
                      <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2 Visual */}
              {activeStep === 2 && (
                <div className="p-6 sm:p-8 space-y-4 animate-in fade-in duration-200">
                  <div className="text-center space-y-1">
                    <span className="text-xs font-bold text-[#08739C] dark:text-[#38BDF8] uppercase tracking-wider">
                      Step 2: Add to Gmail
                    </span>
                    <h4 className="text-base font-bold text-foreground">
                      Paste it into Gmail’s Forwarding Box
                    </h4>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                      Click the button below to jump straight to the exact page in your Gmail. Then
                      click <strong>&quot;Add a forwarding address&quot;</strong> and paste!
                    </p>
                  </div>

                  {/* Gmail UI Representation */}
                  <div className="max-w-md mx-auto p-4 rounded-xl bg-muted/60 border border-dashed border-border space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">Gmail Forwarding:</span>
                      <span className="text-[11px] text-muted-foreground">Settings &gt; Forwarding</span>
                    </div>
                    <div className="p-3 bg-background rounded-lg border border-border flex items-center justify-between">
                      <span className="text-muted-foreground font-mono text-[11px] truncate">
                        {forwardAddress}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        Pasted ✓
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-2">
                    <a
                      href="https://mail.google.com/mail/u/0/#settings/fwdandpop"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-[#08739C] hover:bg-[#076184] text-white font-semibold text-xs px-4 h-9 rounded-xl transition-colors cursor-pointer shadow-xs"
                    >
                      <span>Open My Gmail Forwarding Page</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveStep(3)}
                      className="text-xs h-9 rounded-xl cursor-pointer"
                    >
                      Next: See Magic Verification →
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3 Visual */}
              {activeStep === 3 && (
                <div className="p-6 sm:p-8 text-center space-y-4 animate-in fade-in duration-200">
                  <div className="mx-auto h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-foreground">
                      Zero Confirmation Codes Needed!
                    </h4>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1 leading-relaxed">
                      Usually, Google sends an annoying code to confirm forwarding. But our backend
                      approves it for you automatically in the background. You’re done!
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 p-2.5 px-4 rounded-xl bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-500/20">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Listening for your incoming brand deals 24/7</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: Simple 3-Step Checklist */}
        {activeView === 'checklist' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Item 1 */}
              <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FC801A] text-white text-xs font-bold">
                  1
                </span>
                <h4 className="text-xs font-bold text-foreground">Copy Address</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Click the orange &quot;Copy Address&quot; button above.
                </p>
              </div>

              {/* Item 2 */}
              <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#08739C] text-white text-xs font-bold">
                  2
                </span>
                <h4 className="text-xs font-bold text-foreground">Add to Gmail</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Open Gmail Settings &gt; Forwarding, click &quot;Add a forwarding address&quot;, and
                  paste.
                </p>
                <a
                  href="https://mail.google.com/mail/u/0/#settings/fwdandpop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#08739C] dark:text-[#38BDF8] hover:underline cursor-pointer pt-1"
                >
                  <span>Open Gmail Settings</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {/* Item 3 */}
              <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold">
                  3
                </span>
                <h4 className="text-xs font-bold text-foreground">Auto-Approved!</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Menitap automatically confirms Google’s verification link. Every deal appears as a
                  card!
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
