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
select
  'Loan Approval System',
  'Seed blueprint for validating the Bernuda executable preview flow.',
  'Retail Banking',
  'Generate a loan approval workflow with KYC, credit decisioning, manager approval, and customer notifications.',
  'in_review',
  '{"workflow_source":"seed","workflow_preview_mode":"designer"}'::jsonb
where not exists (
  select 1 from public.workflow_applications where workflow_name = 'Loan Approval System'
);

insert into public.workflow_applications (
  workflow_name,
  workflow_description,
  workflow_department,
  workflow_objective,
  workflow_status,
  workflow_json_definition
)
select
  'Vendor Onboarding Workflow',
  'Tracks supplier setup, compliance review, and access provisioning.',
  'Operations',
  'Create an end-to-end vendor onboarding process with document checks, approval, and provisioning.',
  'draft',
  '{"workflow_source":"seed","workflow_preview_mode":"designer"}'::jsonb
where not exists (
  select 1 from public.workflow_applications where workflow_name = 'Vendor Onboarding Workflow'
);

insert into public.workflow_applications (
  workflow_name,
  workflow_description,
  workflow_department,
  workflow_objective,
  workflow_status,
  workflow_json_definition
)
select
  'Benefits Approval Flow',
  'Manages employee benefits requests and manager approvals.',
  'HR',
  'Process employee benefits requests with automated eligibility checks and approval routing.',
  'approved',
  '{"workflow_source":"seed","workflow_preview_mode":"executive"}'::jsonb
where not exists (
  select 1 from public.workflow_applications where workflow_name = 'Benefits Approval Flow'
);

insert into public.workflow_activities (
  workflow_action,
  workflow_description,
  workflow_metadata
)
select
  'Seeded workflow record',
  workflow_name || ' seeded into the portal dataset.',
  jsonb_build_object('workflow_name', workflow_name, 'workflow_status', workflow_status)
from public.workflow_applications
where workflow_name in ('Loan Approval System', 'Vendor Onboarding Workflow', 'Benefits Approval Flow')
and not exists (
  select 1 from public.workflow_activities a
  where a.workflow_description = workflow_applications.workflow_name || ' seeded into the portal dataset.'
);

insert into public.workflow_audit_logs (
  workflow_action,
  workflow_entity_name,
  workflow_new_values,
  workflow_outcome
)
select
  'Seeded workflow record',
  'workflow_applications',
  jsonb_build_object('workflow_name', workflow_name, 'workflow_status', workflow_status),
  'success'
from public.workflow_applications
where workflow_name in ('Loan Approval System', 'Vendor Onboarding Workflow', 'Benefits Approval Flow')
and not exists (
  select 1 from public.workflow_audit_logs a
  where a.workflow_action = 'Seeded workflow record'
    and a.workflow_new_values->>'workflow_name' = workflow_applications.workflow_name
);
