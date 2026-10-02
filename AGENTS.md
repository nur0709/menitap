# AGENTS.md — AI Agent Instructions for Menitap

## Project Overview
Menitap (formerly UGCP) is a subscription SaaS platform connecting UGC creators with brands, and offering affiliate-linked product discounts to shoppers.

## Tech Stack
- **Framework**: Next.js 15 (App Router, React Server Components)
- **Language**: TypeScript (strict mode)
- **Hosting**: Cloudflare Pages
- **Database**: Supabase PostgreSQL
- **ORM**: Drizzle ORM
- **Auth**: Supabase Auth (Google OAuth + email/password)
- **Payments**: Stripe (webhooks + local DB mirror)
- **UI**: Tailwind CSS + shadcn/ui
- **Monorepo**: Turborepo + pnpm
- **Storage**: Cloudflare R2 (S3-compatible)

## Architecture Rules

### File Organization
- **Feature-sliced design**: Group code by feature in `src/features/<name>/`
- **Server Actions**: All mutations go through `src/server/actions/`
- **Database queries**: Only in `src/server/db/`
- **Components**: Reusable UI in `src/components/`, feature-specific in `src/features/<name>/components/`
- **API Routes**: Only for webhooks and external integrations in `src/app/api/`

### Coding Standards
- TypeScript strict mode — never use `any` type
- All exports must be named exports (no default exports except Next.js pages)
- Use `"use server"` directive for Server Actions
- Use `"use client"` directive only when client interactivity is required
- Prefer React Server Components by default
- Use Drizzle ORM for all database operations — never raw SQL
- Use Zod for input validation on all Server Actions
- Use `lucide-react` for icons

### Authentication & Authorization
- Always re-verify the session inside Server Actions (do NOT rely only on middleware)
- Admin routes must check `user.role === 'ADMIN'` in both middleware AND Server Actions
- Never expose Supabase service role key or Stripe secret key to the client

### UGC / Content Rules
- All user-submitted links (affiliate or brand) must default to `status: 'PENDING'`
- Links only appear publicly after admin approval (`status: 'APPROVED'`)
- Image uploads must be validated for type (jpg, png, webp) and size (<5MB)

### Database / Stripe
- Mirror Stripe subscription state in local `subscriptions` table via webhooks
- Never call Stripe API at runtime to check entitlements — read from local DB
- Store feature limits per plan as configuration, not hardcoded values

### Styling
- Use Tailwind CSS utility classes — no custom CSS files unless absolutely necessary
- Use shadcn/ui components — do not install other UI libraries
- Follow mobile-first responsive design
- Use CSS variables defined in `globals.css` for theming

### Testing
- Unit tests with Vitest for utility functions and business logic
- E2E tests with Playwright for critical user flows
- Test files co-located with source: `feature.test.ts` next to `feature.ts`

### Git Conventions
- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
- Branch naming: `feat/<name>`, `fix/<name>`, `chore/<name>`
- PRs must pass CI (lint + typecheck + tests) before merge

## Membership Tiers
| Tier | Price | Key Features |
|------|-------|--------------|
| Buyer-User | Free | Watch educational videos, browse affiliate links |
| Basic Plan | $5/month | Publish affiliate links, contribute brand links, earn points |
| Standard Plan | $10/month | Access brand application links, contribute brand links, earn points |

## Common Commands
```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm lint         # Lint all packages
pnpm typecheck    # TypeScript checks
```

## AI Session Handoff Protocol

> **CRITICAL: Read `PROJECT_STATUS.md` FIRST before doing any work.**

This project uses multiple AI agents across sessions. To prevent conflicts and duplicated work:

1. **START of session**: Read `PROJECT_STATUS.md` to understand current progress and what phase to work on next.
2. **DURING session**: Follow the architecture rules above. Do not deviate from the tech stack decisions without discussing with the user.
3. **END of session**: Update `PROJECT_STATUS.md` with:
   - What you completed (mark items `[x]`)
   - Any new known issues
   - Update the "Last Updated" and "Last Agent" fields
   - Commit the updated file
4. **Key files to review when starting**:
   - `PROJECT_STATUS.md` — Progress tracker and handoff context
   - `AGENTS.md` (this file) — Coding standards and architecture rules
   - `apps/web/src/app/page.tsx` — Landing page
   - `apps/web/.env.example` — Required environment variables

