# PROJECT_STATUS.md — AI Handoff Document

> **Purpose:** This file is the single source of truth for project progress. Any AI agent
> (Gemini, Claude, GPT, Cursor, Copilot, etc.) starting a new session MUST read this file
> first to understand what has been done and what to work on next.
>
> **Rule:** After completing any phase or significant work, UPDATE this file before ending
> the session. This ensures the next agent can pick up seamlessly.

---

## Current Phase: Phase 9.5 — Creator Campaign CRM Polish, Date Picker & Workflow Pipeline (COMPLETED & LIVE)

## Last Updated: 2026-10-10
## Last Agent: Cursor
## GitHub Repo: https://github.com/nur0709/menitap
## Live Production URL: https://menitap.com

---

## Quick Context for New Agents

Menitap is an all-in-one platform tailored for user-generated content (UGC) creators, shoppers, and brand managers.
Read `AGENTS.md` for coding standards and conventions.

**Key architectural decisions & current state:**
- Next.js 16 (App Router) hosted on **Vercel** (`https://menitap.com`) with automatic CI/CD from `main`.
- Custom domain **`menitap.com`** connected via GoDaddy DNS (A record `@` -> `76.76.21.21`, CNAME `www` -> `cname.vercel-dns.com`). Old `menitap.vercel.app` 307-redirects to `menitap.com`.
- **Supabase** for PostgreSQL database + Auth (Google OAuth + email/password), project ID `fkexbdyptynweurzgtqd`.
- **Universal Top & Mobile Navigation Tabs**:
  - `Deals` (`/deals`)
  - `Brand Collabs` (`/collabs`)
  - `Creators` (`/creators`)
  - `Plans` (`/plans`)
  - `About` (`/about`)
  - Fixed 3-column grid layout in `SiteHeader` prevents tabs from shifting across screen sizes.
  - Active tab uses brand orange ring frame (`ring-2 ring-[#FC801A] text-[#FC801A] bg-[#FC801A]/10`).
- **Account Types & Roles (`role` column in `profiles` and auth metadata)**:
  - `USER` (Shopper / Consumer / Explorer): Can browse deals, save items, view beginner resources.
  - `CREATOR` (UGC Creator): Can post affiliate deals (`+ Post a Deal`), access direct brand collaboration campaigns, manage shared links.
  - `BRAND` (Brand Manager): Can post brand collaboration campaigns, search and discover UGC creators.
  - `ADMIN`: Has full privileges and category management per tab. There is no admin preview-role cookie; `getEffectiveUserContext` uses the real profile role.
- **Plans & Pricing Structure** (`/plans`):
  - **Explorer ($0 / Free)**: For deal hunters. Role `USER`, plan `FREE`.
  - **Creator Basic ($10/mo label)**: Sets role `CREATOR` and plan `BASIC`. Posting deals and tracking collabs check role, not a Stripe subscription.
  - **Creator Standard ($15/mo label)**: Sets plan `STANDARD`, which is what unlocks the public portfolio.
  - Switching plans writes `subscriptions` directly. Stripe products, checkout, and webhooks are still unbuilt (Phase 4). A subscription row is ignored unless `status` is `ACTIVE` or `TRIALING`.
- **How a creator's pitches get into the CRM (current)**: Connect Gmail with OAuth (`/api/auth/google/connect`, intent `gmail`). `syncUserGmailCampaigns` reads that mailbox and writes `creator_campaigns`. The dashboard control is `GoogleSyncCard`. Manual add and "track this collab" are the other ways a card is created.
- **Retired, do not extend**: Forwarding pitches to `deals-{token}@in.menitap.com` is not the product anymore. `/api/inbound-email`, `profiles.inbound_email_token`, and the Phase 9 forwarding notes below are leftovers. The dashboard does not ask creators to forward mail.
- **Two campaign tables**:
  - `brand_links`: public Brand Collabs board. Public `/post-collab` submissions stay `PENDING`.
  - `creator_campaigns`: private creator pipeline. Filled by Gmail sync, manual add, or tracking a public collab.
- **Account Page (`/dashboard`)**:
  - Avatar-only in navbar navigates directly to `/dashboard`.
  - Sign Out button is cleanly located on `/dashboard` next to "Switch Plan".
- **Category System**:
  - `categories` table with `type` column: `'DEALS'`, `'CREATORS'`, `'BRANDS'`.
  - Admin accounts can add/delete categories per tab directly in My Account (`/dashboard`).
- **shadcn/ui** for components (uses `@base-ui/react`, NOT Radix — `asChild` prop does NOT exist, use `buttonVariants()` with `Link`).

---

## Phase Completion Status

### ✅ Phase 1 — Landing Page + Repo Setup (COMPLETED) — [#8](https://github.com/nur0709/menitap/issues/8)
- [x] Turborepo monorepo initialized with pnpm
- [x] Next.js 15/16 (App Router) with TypeScript
- [x] Tailwind CSS + shadcn/ui
- [x] Landing page with hero, features, video, FAQ, and footer
- [x] Production deployment verified live

### ✅ Phase 2 — Authentication + User Accounts (COMPLETED) — [#1](https://github.com/nur0709/menitap/issues/1)
- [x] Supabase client (`@supabase/supabase-js`, `@supabase/ssr`)
- [x] Google OAuth & Email/Password auth modal
- [x] Session management middleware (`middleware.ts`)
- [x] Protected User Dashboard at `/dashboard` with tier display & sign out
- [x] Role-based access control handling (`USER`, `CREATOR`, `BRAND`, `ADMIN`)

### ✅ Phase 3 — Database + Link Submission (COMPLETED) — [#2](https://github.com/nur0709/menitap/issues/2)
- [x] Supabase PostgreSQL database schema configured & migrations applied
- [x] Tables created with RLS & Triggers: `profiles`, `subscriptions`, `categories`, `affiliate_links`, `brand_links`, `point_transactions`
- [x] Auto-sync triggers for new user profiles and default free subscriptions
- [x] Server actions for link creation and retrieval (`apps/web/src/features/links/actions.ts`)

### ✅ Phase 5 — Browse, Navigation & Minimalist Redesign (COMPLETED) — [#4](https://github.com/nur0709/menitap/issues/4)
- [x] Renamed and refined tabs:
  - `/deals` (Deals)
  - `/collabs` (Brand Collabs)
  - `/creators` (Creators)
  - `/plans` (Plans)
  - `/about` (How Menitap Works narrative)
- [x] Smart in-page gating ribbons for visitors on `/collabs` and `/creators`
- [x] 3-column grid header locking center tabs firmly in place without shifts
- [x] Unified brand orange active ring highlight on navbar and mobile drawer
- [x] Pruned all dead code, legacy modals, and redundant callout banners

### ✅ Phase 5.5 — Brand Campaign Ingestion & Smart Metadata Engine (COMPLETED)
- [x] High-performance metadata scraper API (`/api/extract-metadata` via `cheerio` + fallback)
- [x] Public frictionless `/post-collab` page for self-serve brand submissions (user_id nullable)
- [x] Dynamic auto-population of brand name, product title, and description on URL input
- [x] Admin approval queue (`AdminCampaignReview`) for pending brand collab submissions
- [x] Aligned category taxonomies between `/post-collab` and `/collabs`

### ✅ Phase 6 — Admin Workspace & Category Management (COMPLETED) — [#5](https://github.com/nur0709/menitap/issues/5)
- [x] Decoupled Admin view on `/dashboard` into 2 clean tabs (`Pending Collabs` & `Categories`)
- [x] Admin approval queue (`AdminCampaignReview`) for pending brand collab submissions
- [x] Upgraded Category Manager with live tab labels (`Deals`, `Brand Collabs`, `Creators`)
- [x] Removed irrelevant consumer upsells ("Switch Plan") for Admin accounts

### ✅ Phase 9 — Creator Campaign Hub (Gmail sync is the live intake; forwarding below is retired)
- [x] **Production Domain (`menitap.com`)**: Live with SSL; GoDaddy DNS configured with apex A record (`76.76.21.21`) and `www` CNAME (`cname.vercel-dns.com`). Old `menitap.vercel.app` 307-redirects to `menitap.com`.
- [x] **Inbound Email Subdomain (`in.menitap.com`)**: Configured via Resend with MX `inbound-smtp.us-east-1.amazonaws.com` (priority 10), SPF, and DKIM TXT records.
- [x] **RFC Hyphen Addressing Format**: Switched from plus-addressing to `deals-{token}@in.menitap.com` to prevent Gmail Forwarding validator rejections (*"Invalid forwarding address"*).
- [x] **Resend Inbound Webhook (`/api/inbound-email`)**: Ingests email events and fetches full payloads from `https://api.resend.com/emails/receiving/{emailId}`.
- [x] **Google Forwarding Verification Bypass**: Intercepts Google confirmation emails, extracts 9-digit codes / verification links, and exits early without generating dummy cards.
- [x] **Dual-Engine AI Pitch Parser**: Uses Gemini 2.5 Flash -> Groq LLama 3.3 -> Regex heuristics to extract brand name, deliverables, compensation, deadlines, and application links.
- [x] **Actionable Creator Deal Cards (`/dashboard`)**:
  - Displays brand logo/fallback, compensation pill, highlighted deadlines (overdue/today/upcoming), deliverables, and relative timestamp (`formatTimeAgo`).
  - Action button **"Review"** opens details modal.
  - Clicking "Review" auto-transitions status from `NEW_PITCH` -> `REVIEWED`, clearing the pulsing `🟢 New` radar badge.
  - Lifecycle statuses: `Reviewed` -> `Accepted` -> `Delivered` -> `Paid` -> `Declined`.
  - Triage filter tabs: `All`, `Pitches` (encompassing unreviewed & reviewed deals with live pulse indicator), `Accepted`, `Delivered`, `Paid`.
  - Review Modal includes 1-click external form button (Google Forms, Typeform, etc.), pre-written accept reply draft with 1-click Gmail compose, and status selector in footer.
- [x] **Step 2 Onboarding Component**: Clear instructions on `/dashboard` explaining how to forward pitches to `deals-{token}@in.menitap.com`.
 
### ✅ Tooling & Codebase Hygiene — Knip & Optimization Skill (COMPLETED)
- [x] **Knip Tooling Setup**: Configured `knip` (v6.40.0) with Next.js 16 App Router entrypoints (`apps/web/src/app/**/{page,layout,route,template,default,error,loading,not-found}.{tsx,ts}`, `apps/web/src/{middleware,proxy}.{ts,tsx}`) and Tailwind CSS v4 in `knip.json`.
- [x] **Package Script**: Added `"check:dead-code": "knip"` to root `package.json`.
- [x] **Reusable Skill**: Created `.agents/skills/code-hygiene/SKILL.md` documenting periodic audit cycles, verification workflows, safe pruning checklists (Server Actions, RPC, Supabase types, design system variants), and reporting standards.
- [x] **Initial Audit Sweep**: Performed full repo scan, categorized dead exports vs protected foundations, and verified 0 build errors (`pnpm --filter web build`).
- [x] **Audit Targets Pruned & Automated CI Setup**: Safely pruned redundant `@types/cheerio`, dead icon aliases (`InstagramIcon`, `TikTokIcon`, `YouTubeIcon`), unused campaign helpers (`extractBrandDomain`, `extractFirstUrl`), and internalized helpers (`getCurrentUser`, `extractOpenGraphMetadata`, `getGoogleOAuthRedirectUri`, `refreshGoogleAccessToken`, `extractOriginalEmailDetails`). Preserved protected foundation primitives (`client.ts`, `database.types.ts`, `buttonVariants`, `badgeVariants`). Configured GitHub Actions CI workflow (`.github/workflows/ci.yml`) on Node 22 with pnpm caching, running dead-code checks, typechecking, linting, and Next.js production build with environment placeholders.

### ✅ Email Ingestion Hardening & Spam/Duplicate Elimination (COMPLETED)
- [x] **High-Precision Gmail Query**: Replaced loose search terms (`video`, `campaign`, `pitch`) with explicit collaboration phrases (`"brand deal" OR "paid partnership" OR "paid collab" OR "gifted collab" OR "PR package" OR "creator partnership" OR UGC OR deliverables OR "collaboration proposal"`). Added Google category exclusions (`-category:promotions -category:social`) to filter out 95% of consumer retail blasts (Factor75, Quince, Naked Sundays, Amazon) and social alerts (LinkedIn, YouTube) at the Google API layer.
- [x] **Thread Deduplication & Self-Sent Filtering**: Normalized email subjects across Re:/Fwd: prefixes, bracket tags, and symbols. Both Gmail sync and the Inbound Webhook (`/api/inbound-email`) now check existing thread IDs and normalized subjects to prevent duplicate cards when creator replies to brand. Automatically ignores any message sent from the creator's own email.
- [x] **Fail-Closed Fallback & Model Chain Fix**: Replaced the previous permissive single-keyword fallback with a strict, compound fallback that requires explicit collaboration intent AND deliverables/compensation proof, while rejecting unsubscribe links and retail promo copy. Fixed Gemini model list to active endpoints (`gemini-2.0-flash`, `gemini-1.5-flash`).
- [x] **Database Purge**: Executed a safe database purge removing 57 junk cards (retail promo blasts, LinkedIn job alerts, Amazon returns, USPS/SHEIN delivery notices, school/mixer invites, and self-sent Bermet Ermatova replies). Retained only authentic, high-value brand deals (Beekman 1802, Kiimento, FutureMoney, Lucky Rx, Lepique, FourCo, HWahae Global, Old Navy, MOREMO, TIAM, Casting Networks, Cerave, Buttermilk/Epionce).

### ✅ Phase 9.5 — Campaign CRM Polish, Date Picker & Workflow Pipeline (COMPLETED & LIVE)
- [x] **Canonical Status Workflow & Unified Order**:
  - Filter pills and card dropdowns unified in exact order: `Applied` -> `Product received` -> `Content submitted` -> `Waiting payment` -> `Paid` -> `Declined`.
  - Removed obsolete `Pitches` filter tag.
  - Added centralized `normalizeCampaignStatus` utility and updated Postgres database check constraint `chk_campaign_status` with full alias support (`ACCEPTED` -> `APPLIED`, `FILMING` -> `SUBMITTED`, `DELIVERED` -> `PAYMENT_PENDING`).
  - Filter counts and card filtering synchronized 1:1 with O(N) single-pass aggregation.
- [x] **Custom Inline Date Picker**:
  - Replaced native browser `<input type="date">` and its disruptive OS modal pop-ups with an inline expandable custom calendar.
  - Removed "Set manually" subtitle text. Outlined button dynamically shows "Set date" when empty or formatted date when set (e.g. `Oct 25, 2026`).
  - Added dedicated, unified action buttons: **"Clear"** and **"Today"** on both mobile and web.
  - "Clear" reliably resets the deadline to `null` across all devices (solving Android/iOS native reset bugs).
  - Click-outside and Escape key detection smoothly closes the inline calendar.
- [x] **Direct Gmail Account Routing**:
  - `getGmailThreadUrl` and `getGmailComposeUrl` use canonical `/u/0/` with explicit `authuser` query parameter, ensuring links route directly to the creator's connected Google account without getting lost in multi-account collisions.
  - Fixed 301 hash drop and cleaned search queries of emojis that broke quoted Gmail searches.
- [x] **Smart Status Prompt Modal**:
  - Prompts creator to change status to `Applied` or `Declined` upon closing with `X` only if they interacted with `Apply`, `Send` (reply), or `Open Email`.
  - Interacting with Due Date never triggers the status prompt.
  - Backdrop clicks and Escape key smoothly dismiss modals.

### ⬜ Phase 4 — Stripe Subscriptions (Upcoming) — [#3](https://github.com/nur0709/menitap/issues/3)
- [ ] Stripe product/price creation (Explorer $0, Creator Basic $10, Creator Standard $15)
- [ ] Checkout session flow
- [ ] Webhook handler at `/api/webhooks/stripe`
- [ ] Feature gating based on user's active plan

### ⬜ Phase 7 — Points System — [#6](https://github.com/nur0709/menitap/issues/6)
- [ ] Point transaction logic & dashboard

### ⬜ Phase 8 — Polish + Launch — [#7](https://github.com/nur0709/menitap/issues/7)
- [ ] SEO (metadata, sitemap, JSON-LD)
- [ ] Core Web Vitals audit & Playwright tests

---

## Database Schema Reference

```
Profile: id, email, full_name, avatar_url, role (USER|CREATOR|BRAND|ADMIN), inbound_email_token (text unique), created_at, updated_at
CreatorCampaign: id, user_id, brand_name, brand_logo_url, product_name, compensation, deliverables, deadline, status (NEW_PITCH|REVIEWED|APPLIED|WAITING_PRODUCT|SUBMITTED|PAYMENT_PENDING|PAID|DECLINED), is_liked (boolean), raw_source_text, source_type (EMAIL|MANUAL|EXTENSION), source_sender, source_subject, notes, created_at, updated_at
Subscription: id, user_id, stripe_customer_id, stripe_subscription_id, plan (FREE|BASIC|STANDARD), status (ACTIVE|PAST_DUE|CANCELED|TRIALING), current_period_end
Category: id, name, slug, description, sort_order, is_active, type ('DEALS'|'CREATORS'|'BRANDS')
AffiliateLink: id, user_id, category_id, title, product_url, promo_code, description, image_url, discount_percentage, status (ACTIVE|PENDING|APPROVED|REJECTED), click_count
BrandLink: id, user_id, category_id, brand_name, application_url, description, brand_logo_url, status (PENDING|APPROVED|ACTIVE|REJECTED), products_provided
PointTransaction: id, user_id, points, reason, type (EARNED|REDEEMED)
```

---

## Next Steps
1. **User Review on Live Dashboard**: Collect user feedback on the new card visuals, favorite heart toggle, and selection mode bulk delete.
2. **Review Modal Polish**: Refine reply drafts, attachments, or deliverables inside the modal if needed.
3. **Retired leftover**: `/api/inbound-email` and `deals-{token}@in.menitap.com` are not the pitch intake. Do not harden or extend them. Gmail OAuth sync is the path.
4. **Still open**: Row Level Security does not yet enforce role checks that the server actions do. Community and JoinBrands sync still run with the anon client, so those writes are expected to fail closed under RLS until a service-role path exists.

