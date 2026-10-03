# PROJECT_STATUS.md — AI Handoff Document

> **Purpose:** This file is the single source of truth for project progress. Any AI agent
> (Gemini, Claude, GPT, Cursor, Copilot, etc.) starting a new session MUST read this file
> first to understand what has been done and what to work on next.
>
> **Rule:** After completing any phase or significant work, UPDATE this file before ending
> the session. This ensures the next agent can pick up seamlessly.

---

## Current Phase: Phase 1 ✅ → Phase 2 (Next)

## Last Updated: 2026-10-02
## Last Agent: Gemini (Antigravity)
## GitHub Repo: https://github.com/nur0709/menitap

---

## Quick Context for New Agents

Menitap is a subscription SaaS platform for UGC (User-Generated Content) creators and
shoppers. Read `AGENTS.md` for the full tech stack and coding standards.

**Key architectural decisions already made:**
- Next.js 15 (App Router) hosted on **Cloudflare Pages** (NOT Vercel — Vercel Hobby forbids commercial use)
- **Supabase** for PostgreSQL database + Auth (Google OAuth + email/password)
- **Drizzle ORM** (NOT Prisma — Prisma doesn't work on Cloudflare Workers edge)
- **Stripe** for subscriptions with local DB mirror via webhooks
- **Cloudflare R2** for file storage (zero egress fees)
- **shadcn/ui** for components (latest version uses `@base-ui/react`, NOT Radix — `asChild` prop does NOT exist)
- All infrastructure on free tiers — $0/month target

---

## Phase Completion Status

### ✅ Phase 1 — Landing Page + Repo Setup (COMPLETED)
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

### ⬜ Phase 2 — Authentication + User Accounts (NEXT)
- [ ] Install + configure Supabase client (`@supabase/supabase-js`, `@supabase/ssr`)
- [ ] Set up Supabase project (user needs to create at supabase.com)
- [ ] Google OAuth provider configuration
- [ ] Email/password signup flow
- [ ] Auth middleware for protected routes
- [ ] User profile page
- [ ] Role-based access control (USER vs ADMIN roles)
- [ ] Sign-in / Sign-up pages at `(auth)/sign-in` and `(auth)/sign-up`

### ⬜ Phase 3 — Database + Link Submission
- [ ] Supabase PostgreSQL + Drizzle ORM setup
- [ ] Database schema + migrations (see schema in AGENTS.md or plan)
- [ ] Tables: User, Subscription, Category, AffiliateLink, BrandLink, PointTransaction
- [ ] Link submission forms (affiliate + brand)
- [ ] Image upload to Cloudflare R2
- [ ] Input validation with Zod

### ⬜ Phase 4 — Stripe Subscriptions
- [ ] Stripe product/price creation (Free, Basic $5, Standard $10)
- [ ] Checkout session flow
- [ ] Webhook handler at `/api/webhooks/stripe`
- [ ] Local subscription state mirroring
- [ ] Stripe Customer Portal for self-service
- [ ] Feature gating based on user's active plan

### ⬜ Phase 5 — Browse + Filter Links
- [ ] Public browsable directory pages
- [ ] Category management
- [ ] Filter by category, search
- [ ] ISR for category pages
- [ ] Click tracking
- [ ] Pagination

### ⬜ Phase 6 — Admin Panel
- [ ] Admin dashboard at `/admin/*`
- [ ] Category CRUD
- [ ] Link moderation (approve/reject with preview)
- [ ] User management
- [ ] Basic support/messaging

### ⬜ Phase 7 — Points System
- [ ] Point transaction logic
- [ ] Points dashboard for users
- [ ] Redemption against Stripe coupon codes

### ⬜ Phase 8 — Polish + Launch
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
User: id, email, full_name, avatar_url, role (USER|ADMIN), created_at, updated_at
Subscription: id, user_id, stripe_customer_id, stripe_subscription_id, plan (FREE|BASIC|STANDARD), status (ACTIVE|PAST_DUE|CANCELED|TRIALING), current_period_end
Category: id, name, slug, description, sort_order, is_active
AffiliateLink: id, user_id, category_id, title, url, description, product_image_url, discount_percentage, status (PENDING|APPROVED|REJECTED), click_count
BrandLink: id, user_id, category_id, brand_name, application_url, description, brand_logo_url, status (PENDING|APPROVED|REJECTED), products_provided
PointTransaction: id, user_id, points, reason, type (EARNED|REDEEMED)
```

---

## Known Issues / Notes

1. **YouTube video is placeholder** — Replace `dQw4w9WgXcQ` in `apps/web/src/app/page.tsx` with the real explainer video ID.
2. **shadcn/ui Button has NO `asChild` prop** — This version uses `@base-ui/react`. Use `Link` with `buttonVariants()` utility + `cn()` for link-styled buttons.
3. **Supabase project not yet created** — User needs to create one at https://supabase.com and add credentials to `.env.local`.
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
