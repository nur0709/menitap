---
name: code-hygiene
description: >-
  Guidelines and procedures for periodic dead-code audits, unused export pruning,
  dependency hygiene, and verification in the Menitap repository.
---

# Menitap Codebase Hygiene & Optimization Skill

This skill documents how to audit, analyze, and safely prune unused code, orphaned files, and redundant dependencies across the Menitap Next.js 16 monorepo.

---

## When to Run Code Hygiene Sweeps

Perform a code hygiene sweep:
1. **Post-Feature Completion**: After delivering major features or refactoring domain modules (e.g., auth, campaign ingestion, account settings).
2. **Pre-Release / Milestone Checkpoints**: Prior to tagging releases or shipping major milestone branches to staging/production.
3. **Periodic Maintenance**: Bi-weekly or monthly maintenance to prevent technical debt and bundle bloat.
4. **Dependency Audits**: Whenever upgrading packages (e.g., Next.js canary updates, Supabase SDK revisions, Tailwind 4 changes).

---

## Tooling & Execution Commands

Menitap uses **Knip** tailored for Next.js 16 App Router, Turborepo, and Tailwind CSS 4.

### 1. Run the Dead-Code Audit
From the repository root:
```bash
# Using the configured package script:
pnpm check:dead-code

# Or run via knip directly:
pnpm dlx knip
```

### 2. Verify TypeScript & Lint
Ensure TypeScript types and lint checks pass:
```bash
pnpm typecheck
pnpm lint
```

### 3. Verify Production Build
Always verify that pruning has not broken routing, page generation, or bundling:
```bash
pnpm --filter web build
```

---

## Safe Pruning Guidelines

Never delete an export or file solely because Knip flags it without running through this safety checklist:

### 1. Server Actions (`"use server"`)
- Check if functions exported from `actions.ts` files are referenced dynamically, invoked from forms, or exposed for client RPC.
- Confirm whether an action is intended for upcoming forms or client mutation boundaries.

### 2. Database RPC & Supabase Generated Schema
- **NEVER prune exports inside `apps/web/src/lib/supabase/database.types.ts`**:
  - Types like `Json`, `Tables`, `TablesInsert`, `TablesUpdate`, `Enums`, `CompositeTypes`, and `Constants` are auto-generated via `supabase gen types typescript`.
  - Manual pruning here creates drift with the Supabase schema and will be overwritten on the next schema sync.
- Verify whether utility functions prepare payloads for Supabase RPCs or edge functions before removing them.

### 3. Next.js Routing Conventions & Middleware
- Keep entrypoints matching Next.js 16 conventions:
  - `src/app/**/{page,layout,route,template,default,error,loading,not-found}.tsx`
  - `src/middleware.ts` / `src/proxy.ts` (Next 16 proxy convention)
  - `next.config.ts`

### 4. Design System & UI Variants
- Components in `apps/web/src/components/ui/` (e.g., `button.tsx`, `badge.tsx`, `card.tsx`) follow shadcn / `@base-ui/react` patterns.
- Exports such as `buttonVariants` and `badgeVariants` are part of the component contract (mandated in `AGENTS.md` for styling `Link` tags without Radix `asChild`).
- Retain component variants and subcomponents (`CardAction`, `CardDescription`) if they are standard primitives of the design system.

### 5. Architectural Foundation Files
- Foundation singletons such as `apps/web/src/lib/supabase/client.ts` (browser client factory) should be retained if they are standard SDK utilities awaiting client-side component integration.

### 6. Dynamic or Future Integrations
- Functions in OAuth or integration helpers (e.g. `refreshGoogleAccessToken`, `getGoogleOAuthRedirectUri`) might be called during specific webhook or background sync workflows. Always grep the entire repository before removal.

---

## Clean Reporting Format

When presenting audit findings to the team or in PRs, use this structured reporting template:

```markdown
### 🧹 Code Hygiene Audit Report

#### 1. Orphaned / Unused Files
- [ ] `path/to/file.ts`: Description (e.g. Safe to delete / Keep as foundation)

#### 2. Unused Dependencies & DevDependencies
- [ ] `package-name` (`apps/web/package.json`): Reason / Safe to remove

#### 3. Unused Exports & Types
- **Pruning Candidates (Safe)**:
  - `symbolName` in `path/to/file.ts`
- **Protected / Intentional Exports (Keep)**:
  - `database.types.ts` generated Supabase schema
  - Design system variants (`buttonVariants`, `badgeVariants`)
  - Integration utilities pending deployment

#### 4. Build & Validation Status
- `pnpm check:dead-code`: [Result / Issue count]
- `pnpm --filter web build`: [Pass / Fail]
```
