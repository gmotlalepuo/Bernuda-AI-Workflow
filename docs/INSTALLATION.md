# Installation

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and fill Supabase values.
3. Apply `supabase/migrations/202606230001_workflow_core_schema.sql`.
4. Apply `supabase/migrations/202606230002_workflow_auth_roles_rls.sql`.
5. Apply `supabase/seed.sql`.
6. Set `BERNUDA_ADMIN_EMAIL`, `BERNUDA_ADMIN_PASSWORD`, `BERNUDA_DESIGNER_EMAIL`, `BERNUDA_DESIGNER_PASSWORD`, `BERNUDA_VIEWER_EMAIL`, and `BERNUDA_VIEWER_PASSWORD` in `.env.local`.
7. Run `npm run seed:users` to create the first administrator, designer, and viewer.
8. Start locally with `npm run dev`.

The application runs at `http://localhost:3000` by default.
