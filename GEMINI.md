# Gemini / Antigravity Rules for Menitap

Refer to `AGENTS.md` for the full project context, tech stack, and coding standards.

## Antigravity Rules:
- **Server Actions & Database**: Use Supabase Server Client (`createClient()` from `@/lib/supabase/server`) for database queries and mutations.
- **Input Validation**: Validate all form inputs and external payloads with Zod schemas.
- **AI & Scraper Fallbacks**: When building AI-enhanced features (such as campaign link parsing), always provide a robust zero-cost fallback (e.g. OpenGraph HTML scraping) so the app never fails if external AI keys or tokens expire.
- **UI & Layout**: Preserve the 3-column grid structure in `SiteHeader` to ensure navigation tabs remain perfectly locked in the center. Use the orange brand ring (`ring-2 ring-[#FC801A]`) for active navigation states.
- **Verification**: Always run `pnpm --filter web typecheck && pnpm --filter web lint` before completing tasks.
