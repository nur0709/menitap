// Retired leftover. Creators sync pitches by connecting Gmail (`syncUserGmailCampaigns`).
// Do not extend deals-{token}@ forwarding or this webhook.
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServiceRoleClient } from '@/lib/supabase/server'
import {
  parseEmailToCampaignCard,
  isObviouslyNotCollaboration,
  normalizeCampaignSubject,
} from '@/features/campaigns/lib/email-card-parser'
import {
  isCastingNewsletter,
  ingestNewsletterCollabs,
} from '@/features/links/lib/newsletter-digest-parser'

function extractDealsToken(recipients: string[]): string | null {
  for (const recipient of recipients) {
    const match = recipient.match(/deals[-+._]([a-zA-Z0-9_-]+)@/i)
    if (match?.[1]) return match[1]
  }
  return null
}

function extractInboundToken(recipients: string[]): string | null {
  const dealsToken = extractDealsToken(recipients)
  if (dealsToken) return dealsToken

  for (const recipient of recipients) {
    const match = recipient.match(/^([a-zA-Z0-9_-]+)@in\.menitap\.com/i)
    if (match?.[1]) return match[1]
  }
  return null
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json()

    // 1. Normalize Payload (Resend format vs Direct Webhook / Test format)
    let toList: string[] = []
    let from = ''
    let subject = ''
    let textBody = ''

    if (rawBody.type === 'email.received' && rawBody.data) {
      // Resend Webhook Envelope
      toList = Array.isArray(rawBody.data.to) ? rawBody.data.to : [rawBody.data.to]
      from = rawBody.data.from || ''
      subject = rawBody.data.subject || ''

      // If Resend provided email_id, attempt to fetch full content from Resend Receiving API
      const emailId = rawBody.data.email_id
      const resendApiKey = process.env.RESEND_API_KEY
      if (emailId && resendApiKey) {
        try {
          // The correct Resend endpoint for inbound received emails is /emails/receiving/{id}
          const res = await fetch(`https://api.resend.com/emails/receiving/${emailId}`, {
            headers: { Authorization: `Bearer ${resendApiKey}` },
          })
          if (res.ok) {
            const emailDetail = await res.json()
            textBody = emailDetail.text || emailDetail.html || ''
          } else {
            // Fallback check on standard /emails/{id}
            const fallbackRes = await fetch(`https://api.resend.com/emails/${emailId}`, {
              headers: { Authorization: `Bearer ${resendApiKey}` },
            })
            if (fallbackRes.ok) {
              const emailDetail = await fallbackRes.json()
              textBody = emailDetail.text || emailDetail.html || ''
            }
          }
        } catch (fetchErr) {
          console.warn('[inbound-email] Failed fetching full email from Resend:', fetchErr)
        }
      }

      if (!textBody) {
        textBody = rawBody.data.text || rawBody.data.subject || ''
      }
    } else {
      // Standard Direct Webhook / Postman format
      const rawTo = rawBody.to
      toList = Array.isArray(rawTo) ? rawTo : [rawTo || '']
      from = rawBody.from || ''
      subject = rawBody.subject || ''
      textBody = rawBody.text || rawBody.body || ''
    }

    // 2. Automated Google Forwarding Verification Link Handler
    const isGoogleVerification =
      from.toLowerCase().includes('forwarding-noreply@google.com') ||
      subject.toLowerCase().includes('forwarding confirmation') ||
      textBody.toLowerCase().includes('automatically forward mail')

    const verificationMatch = textBody.match(
      /https?:\/\/(?:mail-settings\.google\.com|mail\.google\.com)\/mail\/vf-[^\s<>"')]+/i
    )

    if (isGoogleVerification || verificationMatch) {
      if (verificationMatch && verificationMatch[0]) {
        const verifyUrl = verificationMatch[0]
        console.log('[inbound-email] Auto-verifying Google forwarding link:', verifyUrl)
        try {
          const verifyRes = await fetch(verifyUrl, {
            method: 'GET',
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
          })
          console.log('[inbound-email] Google verification response status:', verifyRes.status)
        } catch (verifyErr) {
          console.error('[inbound-email] Error pinging Google verification link:', verifyErr)
        }
      }

      // Always return early so Google system confirmation emails never create dummy deal cards
      return NextResponse.json({
        status: 'verified_google_forwarding',
        verifiedUrl: verificationMatch?.[0] || null,
      })
    }

    // Personal inboxes (deals-{token}@) always stay in the creator CRM.
    const personalDealsToken = extractDealsToken(toList)
    const extractedTokenEarly = personalDealsToken ?? extractInboundToken(toList)

    // 2.5 Check if this is a Public Casting Calls Newsletter (e.g. Brands Meet Creators, UGC Club)
    const isPublicNewsletter =
      !personalDealsToken &&
      (toList.some(
        (r) =>
          r.toLowerCase().includes('collabs') ||
          r.toLowerCase().includes('public') ||
          r.toLowerCase().includes('casting')
      ) ||
        isCastingNewsletter(from, subject, textBody))

    if (isPublicNewsletter) {
      console.log(`[inbound-email] Detected public casting newsletter: "${subject}" from "${from}"`)
      const digestResult = await ingestNewsletterCollabs({
        sender: from,
        subject,
        bodyText: textBody,
        rawSource: textBody,
      })

      if (digestResult.isDigest) {
        return NextResponse.json({
          status: 'ingested_public_casting_newsletter',
          ingestedCount: digestResult.ingestedCount,
          skippedCount: digestResult.skippedCount,
          errors: digestResult.errors,
        })
      }
    }

    // 3. Extract User Inbound Token from Recipient (e.g. deals-55cddc46@in.menitap.com)
    const extractedToken = extractedTokenEarly

    if (!extractedToken) {
      console.warn('[inbound-email] No valid deals+token found in recipients:', toList)
      return NextResponse.json(
        { error: 'No valid deals+token found in recipients' },
        { status: 400 }
      )
    }

    // Fast pre-filter against known non-collab patterns (newsletters, receipts, job alerts)
    if (isObviouslyNotCollaboration(from, subject, textBody)) {
      console.log(`[inbound-email] Fast-filtered non-collab email: "${subject}" from "${from}"`)
      return NextResponse.json({
        status: 'fast_filtered_not_a_collaboration',
        subject,
        sender: from,
      })
    }

    // Connect to Supabase to verify user token and prevent self-replies / duplicates
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Lookup user profile by token
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('inbound_email_token', extractedToken)
      .single()

    if (!profile) {
      console.warn('[inbound-email] Invalid inbound token')
      return NextResponse.json({ error: 'Invalid inbound token' }, { status: 404 })
    }

    // Skip self-sent emails from the user themselves
    if (profile.email && from.toLowerCase().includes(profile.email.toLowerCase())) {
      console.log(`[inbound-email] Skipped self-sent email from "${from}"`)
      return NextResponse.json({ status: 'ignored_self_sent_email' })
    }

    // Deduplicate by normalized subject so replies in the same thread don't spawn duplicate cards.
    // The anon client cannot read another user's campaigns under RLS, so this uses the service role.
    const normSubject = normalizeCampaignSubject(subject)
    const campaignReader = createServiceRoleClient() ?? supabase
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('[inbound-email] SUPABASE_SERVICE_ROLE_KEY missing; subject dedupe may be skipped by RLS')
    }
    const { data: existingCampaigns } = await campaignReader
      .from('creator_campaigns')
      .select('id, source_subject, brand_name')
      .eq('user_id', profile.id)

    const existingMatch = existingCampaigns?.find(
      (c) => c.source_subject && normalizeCampaignSubject(c.source_subject) === normSubject
    )

    if (existingMatch) {
      console.log(
        `[inbound-email] Deduped existing campaign for subject "${subject}" (id: ${existingMatch.id})`
      )
      return NextResponse.json({
        success: true,
        status: 'deduplicated_existing_campaign',
        campaignId: existingMatch.id,
      })
    }

    // 4. Run AI Card Extraction on Email
    const extractedCard = await parseEmailToCampaignCard({
      text: textBody,
      sender: from,
      subject,
      userEmail: profile.email || undefined,
    })

    if (!extractedCard) {
      console.log(
        `[inbound-email] Ignored non-collaboration email: "${subject}" from "${from}"`
      )
      return NextResponse.json({
        status: 'ignored_not_a_collaboration',
        subject,
        sender: from,
      })
    }

    const deadlineIso = extractedCard.deadline
      ? new Date(extractedCard.deadline).toISOString()
      : null

    const { data: campaignId, error: rpcError } = await supabase.rpc(
      'create_inbound_campaign',
      {
        p_inbound_token: extractedToken,
        p_brand_name: extractedCard.brandName,
        p_brand_logo_url: extractedCard.brandLogoUrl,
        p_product_name: extractedCard.productName,
        p_compensation: extractedCard.compensation,
        p_deliverables: extractedCard.deliverables,
        p_deadline: deadlineIso,
        p_raw_source_text: textBody,
        p_source_sender: extractedCard.cleanSender,
        p_source_subject: extractedCard.cleanSubject,
      }
    )

    if (rpcError) {
      console.error('[inbound-email] Error creating inbound campaign via RPC:', rpcError)
      return NextResponse.json({ error: rpcError.message }, { status: 422 })
    }

    console.log(
      `[inbound-email] Successfully ingested campaign (${extractedCard.brandName}) for profile ${profile.id}`
    )

    return NextResponse.json({
      success: true,
      campaignId,
      brand: extractedCard.brandName,
      compensation: extractedCard.compensation,
      deliverables: extractedCard.deliverables,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[inbound-email] Fatal error processing inbound webhook:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
