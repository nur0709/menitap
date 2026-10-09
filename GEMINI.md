# Gemini / Antigravity Rules for Menitap

Refer to `AGENTS.md` for the full project context, tech stack, and coding standards.

## Scope Discipline & Minimal Diff Principle (STRICT YAGNI):
- **Solve Only What Is Asked (Strict YAGNI)**: Implement only what the user explicitly requested. Never anticipate hypothetical future needs or add unprompted features (e.g., extra management tables, unrequested metric cards, complex dashboards, auxiliary buttons).
- **Minimal Code Footprint**: Always prefer the smallest, cleanest, simplest diff. If a solution can be written in 30–50 lines, never create 300+ line subsystems or multi-file abstractions.
- **Propose, Do Not Presume**: If you think of an additional useful feature or improvement, mention it briefly in chat as an idea. **NEVER implement it in code unless the user explicitly approves.**

## Antigravity Rules:
- **Server Actions & Database**: Use Supabase Server Client (`createClient()` from `@/lib/supabase/server`) for database queries and mutations.
- **Input Validation**: Validate all form inputs and external payloads with Zod schemas.
- **AI & Scraper Fallbacks**: When building AI-enhanced features (such as campaign link parsing), always provide a robust zero-cost fallback (e.g. OpenGraph HTML scraping) so the app never fails if external AI keys or tokens expire.
- **UI & Layout**: Preserve the 3-column grid structure in `SiteHeader` to ensure navigation tabs remain perfectly locked in the center. Use the orange brand ring (`ring-2 ring-[#FC801A]`) for active navigation states.
- **Verification**: Always run `pnpm --filter web typecheck && pnpm --filter web lint` before completing tasks.

## Critical Technical Partner & Feasibility Rule (Anti-Tunnel-Vision):
- **Feasibility Reality Check First**: Before writing scrapers, ingestion pipelines, or features based on assumed external data or user proposals, FIRST verify if that data actually exists in the wild in the required format and accessibility.
- **Challenge Flawed Premises Upfront**: Never be an agreeable "code monkey". If a proposed feature or data source contradicts industry reality, API limitations, or anti-bot protections (e.g. trying to scrape private brand deals off Google), state the exact constraint immediately to the user before writing code.
- **No Endless Patch Loops on Structurally Broken Ideas**: If an implementation produces bad, misleading, or synthetic placeholder data (e.g., store homepages instead of application forms, affiliate links instead of creator gigs), STOP immediately. Do NOT write more regexes, filters, or synthetic generators to mask the problem. Call out the structural flaw directly and recommend the real architectural solution.

