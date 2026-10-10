import { NextRequest, NextResponse } from 'next/server'
import { smartExtractCampaignMetadata } from '@/lib/link-parser'
import { assertPublicHttpUrl } from '@/lib/public-url'

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Valid URL is required' }, { status: 400 })
    }

    const publicUrl = await assertPublicHttpUrl(url)
    const metadata = await smartExtractCampaignMetadata(publicUrl.toString())

    return NextResponse.json({ success: true, data: metadata })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to extract metadata'
    const clientError =
      message === 'Enter a valid http(s) URL' ||
      message === 'Only http(s) URLs are allowed' ||
      message === 'URLs with credentials are not allowed' ||
      message === 'That host cannot be fetched'
    if (!clientError) {
      console.error('API /api/extract-metadata error:', error)
    }
    return NextResponse.json(
      { error: clientError ? message : 'Failed to extract metadata' },
      { status: clientError ? 400 : 500 }
    )
  }
}
