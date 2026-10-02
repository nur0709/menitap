# Gemini / Antigravity Rules for Menitap

Refer to `AGENTS.md` for the full project context, tech stack, and coding standards.

## Additional Gemini-specific rules:
- When creating new features, always create the Drizzle schema first, then Server Actions, then UI.
- When modifying database schema, generate a migration with `pnpm drizzle-kit generate`.
- Prefer using subagents for parallel tasks (e.g., building UI + writing tests simultaneously).
- Always verify builds pass after making changes: `pnpm --filter web build`
