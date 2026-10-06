import { Sparkles, Globe } from 'lucide-react'

export interface AutofillOriginBadgeProps {
  source: 'ai_gemini' | 'ai_groq' | 'opengraph' | null | undefined
}

export function AutofillOriginBadge({ source }: AutofillOriginBadgeProps) {
  if (!source) return null

  if (source.startsWith('ai')) {
    const modelLabel = source === 'ai_gemini' ? 'Gemini' : 'Groq'
    return (
      <div className="flex items-center gap-1.5 pt-0.5 animate-in fade-in duration-200">
        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
          <Sparkles className="h-3 w-3 shrink-0" />
          <span>AI Extracted ({modelLabel})</span>
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 pt-0.5 animate-in fade-in duration-200">
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full border border-border">
        <Globe className="h-3 w-3 shrink-0" />
        <span>Page Metadata Extracted</span>
      </span>
    </div>
  )
}
