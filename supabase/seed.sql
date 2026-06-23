insert into public.workflow_roles (workflow_name, workflow_description)
values
  ('Platform Admin', 'Full administrative control for Bernuda.'),
  ('Business Manager', 'Reviews workflows, previews, analytics, and audit events.'),
  ('Customer', 'Runs customer-facing preview experiences.')
on conflict (workflow_name) do nothing;

insert into public.workflow_permissions (workflow_key, workflow_group, workflow_description)
values
  ('workflow.read', 'Workflow', 'Read generated workflow blueprints.'),
  ('workflow.write', 'Workflow', 'Create and update workflow blueprints.'),
  ('preview.run', 'Preview', 'Execute generated app previews.'),
  ('audit.read', 'Compliance', 'Read audit and activity logs.'),
  ('settings.manage', 'Administration', 'Manage application settings.'),
  ('user.manage', 'Administration', 'Manage users and roles.')
on conflict (workflow_key) do nothing;

insert into public.workflow_settings (workflow_key, workflow_group, workflow_value)
values
  ('workflow_security_mfa_required', 'security', 'true'::jsonb),
  ('workflow_preview_cache_enabled', 'features', 'true'::jsonb),
  ('workflow_maintenance_mode', 'operations', 'false'::jsonb)
on conflict (workflow_key) do nothing;

insert into public.workflow_applications (
  workflow_name,
  workflow_description,
  workflow_department,
  workflow_objective,
  workflow_status,
  workflow_json_definition
)
values (
  'Loan Approval System',
  'Seed blueprint for validating the Bernuda executable preview flow.',
  'Retail Banking',
  'Generate a loan approval workflow with KYC, credit decisioning, manager approval, and customer notifications.',
  'in_review',
  '{"workflow_source":"seed","workflow_preview_mode":"designer"}'::jsonb
)
on conflict do nothing;
