# PROJECT_STATUS.md — AI Handoff Document

> **Purpose:** This file is the single source of truth for project progress. Any AI agent
> (Gemini, Claude, GPT, Cursor, Copilot, etc.) starting a new session MUST read this file
> first to understand what has been done and what to work on next.
>
> **Rule:** After completing any phase or significant work, UPDATE this file before ending
> the session. This ensures the next agent can pick up seamlessly.

---

## Current Phase: Phase 5 in progress (Browse, Links & Account Roles)

## Last Updated: 2026-10-04
## Last Agent: Gemini (Antigravity)
## GitHub Repo: https://github.com/nur0709/menitap
## Live Production URL: https://menitap.vercel.app

---

## Quick Context for New Agents

Menitap is an all-in-one platform tailored for user-generated content (UGC) creators, shoppers, and brand managers.
Read `AGENTS.md` for coding standards and conventions.

**Key architectural decisions already made:**
- Next.js 15/16 (App Router) hosted on **Vercel** (`https://menitap.vercel.app`) with automatic CI/CD from `main`.
- **Supabase** for PostgreSQL database + Auth (Google OAuth + email/password), project ID `fkexbdyptynweurzgtqd`.
- **Account Types / Roles (`role` column in `profiles` and auth metadata)**:
  - `USER` (Shopper / Consumer / Explorer): Can browse deals, save items, view free tutorials.
  - `CREATOR` (UGC Creator): Can post affiliate deals (`+ Post a Deal`), access direct brand collaboration campaigns, manage shared links.
  - `BRAND` (Brand Manager): Can post brand collaboration campaigns, search and discover UGC creators.
  - `ADMIN`: Has full privileges, category management per tab, and an account switcher cookie toggle to preview experience as any account type without losing admin status.
- **Plans & Pricing Structure** (`/plans`):
  - **Explorer ($0 / Free)**: For deal hunters & beginner creators (browse affiliate deals, tutorials).
  - **Creator Basic ($10/mo)**: Post affiliate links, direct brand application access, receive products to test.
  - **Creator Standard ($15/mo - Recommended)**: Public Creator Profile & Portfolio, category-filtered brand visibility.
  - **Brand Manager (Free for MVP)**: Post product-for-review campaigns, browse creators by category, zero commission.
- **Category System**:
  - `categories` table with `type` column: `'DEALS'`, `'CREATORS'`, `'BRANDS'`.
  - Admin accounts can add/delete categories per tab directly in My Account (`/dashboard`).
- **MVP Media Scope**: No binary file/blob storage needed for MVP; product/brand external URLs and text metadata are stored directly in PostgreSQL.
- **shadcn/ui** for components (uses `@base-ui/react`, NOT Radix — `asChild` prop does NOT exist, use `buttonVariants()` with `Link`).
- All infrastructure on free tiers — $0/month target.

---

## Phase Completion Status

### ✅ Phase 1 — Landing Page + Repo Setup (COMPLETED) — [#8](https://github.com/nur0709/menitap/issues/8)
- [x] Turborepo monorepo initialized with pnpm
- [x] Next.js 15 (App Router) with TypeScript
- [x] Tailwind CSS + shadcn/ui (button, card, badge, separator)
- [x] Landing page with all sections:
  - [x] Sticky nav with backdrop blur
  - [x] Hero with gradient text + CTA buttons
  - [x] Embedded YouTube video (placeholder: dQw4w9WgXcQ — replace with real video)
  - [x] 6-card features grid
  - [x] 3-tier pricing comparison
  - [x] FAQ accordion (native HTML details/summary — no client JS)
  - [x] CTA banner + footer
- [x] AGENTS.md, GEMINI.md, .cursorrules for AI collaboration
- [x] GitHub Actions CI pipeline (ci.yml)
- [x] .env.example template
- [x] GitHub repo created and pushed
- [x] Production build verified (passes clean)

### ✅ Phase 2 — Authentication + User Accounts (COMPLETED) — [#1](https://github.com/nur0709/menitap/issues/1)
- [x] Install + configure Supabase client (`@supabase/supabase-js`, `@supabase/ssr`)
- [x] Sign-up / Sign-in pages at `(auth)/sign-in` and `(auth)/sign-up` with Zod validation
- [x] Google OAuth provider integration and `/auth/callback` handler
- [x] Email & password authentication Server Actions
- [x] Session management middleware (`middleware.ts`) for route protection
- [x] Protected User Dashboard at `/dashboard` with tier display & sign out
- [x] Role-based access control handling (`USER` vs `ADMIN` roles)
- [x] Supabase project credentials connected and live authentication verified

### ✅ Phase 3 — Database + Link Submission (COMPLETED) — [#2](https://github.com/nur0709/menitap/issues/2)
- [x] Supabase PostgreSQL database schema configured & migrations applied via Supabase MCP
- [x] Tables created with RLS & Triggers: `profiles`, `subscriptions`, `categories`, `affiliate_links`, `brand_links`, `point_transactions`
- [x] Auto-sync triggers for new user profiles and default free subscriptions
- [x] Generated TypeScript definitions at `apps/web/src/lib/supabase/database.types.ts`
- [x] Server actions for link creation and retrieval (`apps/web/src/features/links/actions.ts`)
- [x] Tabbed link submission forms (affiliate deals + brand collaboration links) at `/dashboard/submit` with Zod validation
- [x] User dashboard display with status badges (`PENDING`, `APPROVED`, `REJECTED`)
- [x] Vercel production deployment verified live

### 🔄 Phase 5 — Browse, Categories & Creator Link Management (In Progress)
- [x] Public browsable directory page for **Explore Deals** (`/for-shoppers`)
- [x] `categories` table upgraded with `type` column (`DEALS`, `CREATORS`, `BRANDS`)
- [x] Admin Category Manager in `/dashboard` (Add/Delete category tags per tab)
- [x] `+ Post a Deal` modal for Creator and Admin accounts on Explore Deals
- [x] My Account Shared Deals manager for Creators to track clicks & delete links
- [x] Dynamic tab visibility based on Account Type (`USER`, `CREATOR`, `BRAND`, `ADMIN`)
- [x] Safe Admin Mode toggle (allows admin to test any account experience without role loss)
- [ ] For Creators directory & tab content
- [ ] For Brands directory & tab content

### ⬜ Phase 4 — Stripe Subscriptions (Upcoming) — [#3](https://github.com/nur0709/menitap/issues/3)
- [ ] Stripe product/price creation (Explorer $0, Creator Basic $10, Creator Standard $15)
- [ ] Checkout session flow
- [ ] Webhook handler at `/api/webhooks/stripe`
- [ ] Local subscription state mirroring
- [ ] Stripe Customer Portal for self-service
- [ ] Feature gating based on user's active plan

### ⬜ Phase 6 — Admin Panel — [#5](https://github.com/nur0709/menitap/issues/5)
- [ ] Admin dashboard at `/admin/*`
- [ ] Category CRUD per tab (currently accessible via `/dashboard` for Admin)
- [ ] Link moderation (approve/reject with preview)
- [ ] User management
- [ ] Basic support/messaging

### ⬜ Phase 7 — Points System — [#6](https://github.com/nur0709/menitap/issues/6)
- [ ] Point transaction logic
- [ ] Points dashboard for users
- [ ] Redemption against Stripe coupon codes

### ⬜ Phase 8 — Polish + Launch — [#7](https://github.com/nur0709/menitap/issues/7)
- [ ] SEO (metadata, sitemap, JSON-LD)
- [ ] Core Web Vitals audit
- [ ] E2E tests (Playwright)
- [ ] Error monitoring (Sentry)
- [ ] Analytics
- [ ] Legal pages (Privacy Policy, ToS)
- [ ] Cloudflare Pages deployment

---

## Database Schema Reference

```
User: id, email, full_name, avatar_url, role (USER|CREATOR|BRAND|ADMIN), created_at, updated_at
Subscription: id, user_id, stripe_customer_id, stripe_subscription_id, plan (FREE|BASIC|STANDARD), status (ACTIVE|PAST_DUE|CANCELED|TRIALING), current_period_end
Category: id, name, slug, description, sort_order, is_active, type ('DEALS'|'CREATORS'|'BRANDS')
AffiliateLink: id, user_id, category_id, title, url, promo_code, description, product_image_url, discount_percentage, status (ACTIVE|PENDING|APPROVED|REJECTED), click_count
BrandLink: id, user_id, category_id, brand_name, application_url, description, brand_logo_url, status (PENDING|APPROVED|REJECTED), products_provided
PointTransaction: id, user_id, points, reason, type (EARNED|REDEEMED)
```

---

## Known Issues / Notes

1. **YouTube video is placeholder** — Replace `dQw4w9WgXcQ` in `apps/web/src/app/page.tsx` with the real explainer video ID.
2. **shadcn/ui Button has NO `asChild` prop** — This version uses `@base-ui/react`. Use `Link` with `buttonVariants()` utility + `cn()` for link-styled buttons.
3. **Supabase project connected** — Project `fkexbdyptynweurzgtqd` is fully active and migrated.
4. **Stripe not yet configured** — Phase 4 dependency.
5. **Footer copyright says 2024** — Update to current year.
6. **No favicon yet** — Default Next.js favicon in place.

---

## Environment Setup (for new developers or agents)

```bash
# Prerequisites
node --version   # v20.x required (managed by fnm)
pnpm --version   # v12.x

# Install dependencies
pnpm install

# Run dev server
pnpm dev         # Opens at http://localhost:3000

# Build for production
pnpm build

# Project root
/Users/bermetermatova/Dev/menitap
```

---

## How to Update This File

When you finish a work session:
1. Mark completed items with `[x]`
2. Update "Current Phase" at the top
3. Update "Last Updated" date and "Last Agent" name
4. Add any new "Known Issues / Notes"
5. Commit: `git commit -m "docs: update project status after [description]"`
