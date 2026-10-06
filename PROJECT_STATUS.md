# PROJECT_STATUS.md — AI Handoff Document

> **Purpose:** This file is the single source of truth for project progress. Any AI agent
> (Gemini, Claude, GPT, Cursor, Copilot, etc.) starting a new session MUST read this file
> first to understand what has been done and what to work on next.
>
> **Rule:** After completing any phase or significant work, UPDATE this file before ending
> the session. This ensures the next agent can pick up seamlessly.

---

## Current Phase: Phase 5.5 — Brand Campaign Ingestion & AI Auto-Fill Engine

## Last Updated: 2026-10-05
## Last Agent: Gemini (Antigravity)
## GitHub Repo: https://github.com/nur0709/menitap
## Live Production URL: https://menitap.vercel.app

---

## Quick Context for New Agents

Menitap is an all-in-one platform tailored for user-generated content (UGC) creators, shoppers, and brand managers.
Read `AGENTS.md` for coding standards and conventions.

**Key architectural decisions & current state:**
- Next.js 16 (App Router) hosted on **Vercel** (`https://menitap.vercel.app`) with automatic CI/CD from `main`.
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

### ✅ Phase 6 — Admin Workspace & Platform Control Hub (COMPLETED) — [#5](https://github.com/nur0709/menitap/issues/5)
- [x] Decoupled Admin Command Center on `/dashboard` (replacing stacked single-card layout)
- [x] Segmented tab navigation (`Moderation Queue`, `Category Taxonomies`, `Live Collabs`, `Admin Account`)
- [x] Real-time platform KPI summary cards (Pending Collabs, Active Collabs, Active Deals, Verified Creators)
- [x] Upgraded Category Manager with live tab labels (`Deals`, `Brand Collabs`, `Creators`)
- [x] Live Brand Collabs content moderation with 1-click admin removal
- [x] Header and mobile nav quick-access badges for administrator role
- [x] Removed irrelevant consumer upsells ("Switch Plan") for Admin accounts

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
User: id, email, full_name, avatar_url, role (USER|CREATOR|BRAND|ADMIN), created_at, updated_at
Subscription: id, user_id, stripe_customer_id, stripe_subscription_id, plan (FREE|BASIC|STANDARD), status (ACTIVE|PAST_DUE|CANCELED|TRIALING), current_period_end
Category: id, name, slug, description, sort_order, is_active, type ('DEALS'|'CREATORS'|'BRANDS')
AffiliateLink: id, user_id, category_id, title, url, promo_code, description, product_image_url, discount_percentage, status (ACTIVE|PENDING|APPROVED|REJECTED), click_count
BrandLink: id, user_id, category_id, brand_name, application_url, description, brand_logo_url, status (PENDING|APPROVED|ACTIVE|REJECTED), products_provided
PointTransaction: id, user_id, points, reason, type (EARNED|REDEEMED)
```
