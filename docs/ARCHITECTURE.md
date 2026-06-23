# Bernuda Architecture

Bernuda is implemented as a Next.js App Router application with a Supabase/PostgreSQL persistence layer and an AI orchestration boundary for Ollama/Qwen or future model providers.

## Layers

- Presentation: `app/` routes and `components/` for shell, builder, data grids, workflow map, and preview simulator.
- Business: `lib/preview-engine.ts` and validation/use-case contracts.
- Data: Supabase tables in `supabase/migrations`, all prefixed with `workflow_`.
- Infrastructure: health API, secure headers, environment configuration, Docker, and CI.

## Key Decisions

- All database tables, columns, indexes, constraints, and policies use `workflow_` prefixes to avoid collisions with the existing database.
- The preview engine is JSON-driven so generated pages, role visibility, workflow state, and simulated actions can be stored and replayed.
- Forms use client validation and API validation. Long-form builder state autosaves locally and is ready to persist to Supabase.
- RBAC is modeled with roles, permissions, and route/component guard-ready permission keys.

## Production Backlog

- Connect Supabase Auth and RLS policies to real authenticated users.
- Implement background job processing for AI generation, file scanning, and email.
- Add Playwright end-to-end tests once a browser test runner is installed.
- Replace mock AI output with streaming orchestration from Ollama or a hosted model gateway.
