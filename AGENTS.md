# AGENTS.md — AI Agent Instructions for Menitap

Menitap is an all-in-one platform tailored for user-generated content (UGC) creators, shoppers, and brand managers. It connects aspirational creators with brands and offers affiliate-linked product discounts to shoppers.

## Tech Stack
- **Framework**: Next.js 16 (App Router, React Server Components)
- **Language**: TypeScript (strict mode)
- **Hosting / CI/CD**: Vercel (Production: https://menitap.com)
- **Database & Auth**: Supabase PostgreSQL + Supabase Auth
- **ORM / Querying**: Supabase Server & Client SDK (`@supabase/ssr`, `@supabase/supabase-js`)
- **Payments**: Stripe (Phase 4 dependency)
- **UI**: Tailwind CSS 4 + shadcn/ui (`@base-ui/react`)
- **Monorepo**: Turborepo + pnpm 12

## Architecture Rules

### Scope Discipline & Minimal Diff Principle (STRICT YAGNI)
1. **Solve Only What Is Requested**: Never add speculative or unrequested features, auxiliary dashboards, extra sub-tables, or metric counters.
2. **Minimal Code Footprint**: Always prefer the smallest, cleanest, simplest diff. If a task can be solved in 30–50 lines, never create 300+ line abstractions or multi-file systems.
3. **Propose First**: If you see an opportunity for an additional enhancement, suggest it briefly in conversational text first. Never generate or commit code for it without explicit user consent.

### File Organization
- **Feature-sliced design**: Group code by feature in `src/features/<name>/`
  - `src/features/auth/` — Session handling, auth modal, user context
  - `src/features/links/` — Deals and campaign actions, modals, and queries
  - `src/features/account/` — Profile, category management, deletion actions
- **Components**: Reusable UI in `src/components/`, feature-specific in `src/features/<name>/components/`
- **API Routes**: Only for webhooks and external integrations in `src/app/api/`

### Coding Standards
- TypeScript strict mode — never use `any` type
- All exports must be named exports (no default exports except Next.js pages)
- Use `"use server"` directive for Server Actions
- Use `"use client"` directive only when client interactivity is required
- Prefer React Server Components by default
- Use Zod for input validation on all Server Actions and forms
- Use `lucide-react` for icons
- **shadcn/ui note**: Uses `@base-ui/react`, NOT Radix — `asChild` does NOT exist; use `buttonVariants()` with `Link`.

### Navigation & Header Standards
- The universal tabs are: `Deals` (`/deals`), `Brand Collabs` (`/collabs`), `Creators` (`/creators`), `Plans` (`/plans`), `About` (`/about`).
- Center navigation tabs are locked with CSS 3-column grid (`grid grid-cols-[1fr_auto_1fr]`) to prevent shifting.
- Active tabs use the brand orange ring frame (`ring-2 ring-[#FC801A] text-[#FC801A] bg-[#FC801A]/10`).
- Sign Out is located inside My Account (`/dashboard`).

### UGC & Campaign Link Ingestion Rules
- User/Brand submitted campaign links default to `status: 'PENDING'` for public submissions, or `'ACTIVE'` for authorized brand/admin posts.
- AI & URL metadata scraping must always have a graceful, non-blocking fallback to OpenGraph meta tags so free tier exhaustion never breaks submission.
- **Feasibility Reality Check First**: Before writing scrapers, ingestion pipelines, or features based on assumed external data or user proposals, FIRST verify if that data actually exists in the wild in the required format and accessibility.
- **Challenge Flawed Premises Upfront**: Never be an agreeable "code monkey". If a proposed feature or data source contradicts industry reality, API limitations, or anti-bot protections (e.g. trying to scrape private brand deals off Google), state the exact constraint immediately to the user before writing code.
- **No Endless Patch Loops on Structurally Broken Ideas**: If an implementation produces bad, misleading, or synthetic placeholder data (e.g., store homepages instead of application forms, affiliate links instead of creator gigs), STOP immediately. Do NOT write more regexes, filters, or synthetic generators to mask the problem. Call out the structural flaw directly and recommend the real architectural solution.

## Account Types & Roles
| Role | User Type | Description & Access |
|---|---|---|
| `USER` | Shopper / Explorer | Default account type. Browses deals on `/deals`, copies verified promo codes, saves favorites. |
| `CREATOR` | UGC Creator | Posts affiliate deals (`+ Post a Deal`), applies to brand campaigns on `/collabs`, manages active links, showcases public portfolio. |
| `BRAND` | Brand Manager | Accesses the For Brands section, creates product review campaigns, discovers UGC creators. |
| `ADMIN` | Platform Administrator | Has full access to all sections. Can switch preview modes safely via admin switcher cookie, manage categories per tab, and moderate campaigns. |

## Common Commands
```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm lint         # ESLint check
pnpm typecheck       # TypeScript check (tsc --noEmit)
pnpm check:dead-code # Dead code & unused dependency audit (Knip)
```

## AI Session Handoff Protocol
1. **START of session**: Read `PROJECT_STATUS.md` first.
2. **DURING session**: Follow the architecture rules above.
3. **END of session**: Update `PROJECT_STATUS.md` before finishing.
