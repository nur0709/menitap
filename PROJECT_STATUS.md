# PROJECT_STATUS.md — AI Handoff Document

> **Purpose:** This file is the single source of truth for project progress. Any AI agent
> (Gemini, Claude, GPT, Cursor, Copilot, etc.) starting a new session MUST read this file
> first to understand what has been done and what to work on next.
>
> **Rule:** After completing any phase or significant work, UPDATE this file before ending
> the session. This ensures the next agent can pick up seamlessly.

---

## Current Phase: Phase 9 — Creator Inbound Campaign Hub & Email Ingestion Pipeline (COMPLETED & LIVE)

## Last Updated: 2026-10-07
## Last Agent: Antigravity
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
  - `ADMIN`: Has full privileges, category management per tab, and an account switcher cookie toggle to preview experience as any account type without losing admin status.
- **Plans & Pricing Structure** (`/plans`):
  - **Explorer ($0 / Free)**: For deal hunters & beginner creators.
  - **Creator Basic ($10/mo)**: Post affiliate links, direct brand application access, receive products to test.
  - **Creator Standard ($15/mo)**: Public Creator Profile & Portfolio, category-filtered brand visibility.
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

### ✅ Phase 9 — Creator Inbound Campaign Hub & Email Ingestion Pipeline (COMPLETED & LIVE)
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
CreatorCampaign: id, user_id, brand_name, brand_logo_url, product_name, compensation, deliverables, deadline, status (NEW_PITCH|REVIEWED|ACCEPTED|FILMING|DELIVERED|PAID|DECLINED), raw_source_text, source_type (EMAIL|MANUAL|EXTENSION), source_sender, source_subject, notes, created_at, updated_at
Subscription: id, user_id, stripe_customer_id, stripe_subscription_id, plan (FREE|BASIC|STANDARD), status (ACTIVE|PAST_DUE|CANCELED|TRIALING), current_period_end
Category: id, name, slug, description, sort_order, is_active, type ('DEALS'|'CREATORS'|'BRANDS')
AffiliateLink: id, user_id, category_id, title, url, promo_code, description, product_image_url, discount_percentage, status (ACTIVE|PENDING|APPROVED|REJECTED), click_count
BrandLink: id, user_id, category_id, brand_name, application_url, description, brand_logo_url, status (PENDING|APPROVED|ACTIVE|REJECTED), products_provided
PointTransaction: id, user_id, points, reason, type (EARNED|REDEEMED)
```

---

## Next Steps (Tomorrow's Testing Session)
1. **Real Pitch Testing**: Have the creator forward 3–5 real brand pitch emails from her Gmail to `deals-55cddc46@in.menitap.com`.
2. **Parser Edge Cases**: Observe if compensation, brand name, and deliverables parse accurately across different agency email layouts.
3. **Workflow Feedback**: Gather feedback on the "Review" -> "Reviewed" lifecycle, the pre-filled Gmail draft, and third-party application form link detection.
