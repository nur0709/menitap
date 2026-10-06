import { NextRequest, NextResponse } from 'next/server'
import { smartExtractCampaignMetadata } from '@/lib/link-parser'

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Valid URL is required' }, { status: 400 })
    }

    const trimmedUrl = url.trim()
    const validUrl = trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')
      ? trimmedUrl
      : `https://${trimmedUrl}`

    const metadata = await smartExtractCampaignMetadata(validUrl)

    return NextResponse.json({ success: true, data: metadata })
  } catch (error) {
    console.error('API /api/extract-metadata error:', error)
    return NextResponse.json({ error: 'Failed to extract metadata' }, { status: 500 })
  }
}
