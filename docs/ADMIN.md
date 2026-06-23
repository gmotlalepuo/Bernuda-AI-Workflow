# Administrator Guide

- Configure Supabase Auth and map authenticated users to `workflow_users`.
- Assign `workflow_roles` and `workflow_permissions` for RBAC.
- Keep MFA required for administrator roles.
- Public registration is disabled. Create bootstrap users with `npm run seed:users`, then create all other users from `/portal/admin`.
- Review `workflow_audit_logs` for authentication failures, permission changes, record mutations, and workflow actions.
- Use `workflow_settings` for feature flags, maintenance mode, notification policy, and security settings.
