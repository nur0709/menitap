'use client'

import { useState, useCallback } from 'react'
import { matchCategory, type MatchableCategory } from '@/lib/category-matcher'
import type { ParsedLinkMetadata } from '@/lib/link-parser'

interface UseLinkAutofillOptions<T extends MatchableCategory> {
  categories: T[]
  onExtracted: (data: ParsedLinkMetadata, matchedCategory: T | null) => void
}

export function useLinkAutofill<T extends MatchableCategory>({
  categories,
  onExtracted,
}: UseLinkAutofillOptions<T>) {
  const [isParsing, setIsParsing] = useState(false)
  const [parseSource, setParseSource] = useState<'ai_gemini' | 'ai_groq' | 'opengraph' | null>(null)

  const handleAutoFill = useCallback(
    async (rawUrl: string) => {
      const trimmed = rawUrl?.trim()
      if (!trimmed || trimmed.length < 8) return

      setIsParsing(true)
      try {
        const res = await fetch('/api/extract-metadata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: trimmed }),
        })

        if (res.ok) {
          const json = await res.json()
          if (json.data) {
            const data: ParsedLinkMetadata = json.data
            setParseSource(data.source || 'opengraph')

            const matched = matchCategory(
              data.suggestedCategory || data.brandName || data.title,
              categories
            )

            onExtracted(data, matched)
          }
        }
      } catch (err) {
        console.warn('[useLinkAutofill] Extraction request failed:', err)
      } finally {
        setIsParsing(false)
      }
    },
    [categories, onExtracted]
  )

  const resetAutofill = useCallback(() => {
    setIsParsing(false)
    setParseSource(null)
  }, [])

  return {
    isParsing,
    parseSource,
    handleAutoFill,
    resetAutofill,
  }
}
