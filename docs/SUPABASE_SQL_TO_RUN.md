# Supabase SQL To Run

Run these files in the Supabase SQL editor in this order:

1. `supabase/migrations/202606230001_workflow_core_schema.sql`
2. `supabase/migrations/202606230002_workflow_auth_roles_rls.sql`
3. `supabase/seed.sql`

After the SQL runs, create the bootstrap Auth users from the terminal:

```powershell
npm run seed:users
```

The seed command reads these values from `.env.local`:

```env
BERNUDA_ADMIN_EMAIL=admin@bernuda.local
BERNUDA_ADMIN_PASSWORD=BernudaAdmin2026!
BERNUDA_DESIGNER_EMAIL=designer@bernuda.local
BERNUDA_DESIGNER_PASSWORD=BernudaDesigner2026!
BERNUDA_VIEWER_EMAIL=viewer@bernuda.local
BERNUDA_VIEWER_PASSWORD=BernudaViewer2026!
```

Quick verification SQL:

```sql
select workflow_email, workflow_role, workflow_department
from public.workflow_users
order by workflow_role;
```
