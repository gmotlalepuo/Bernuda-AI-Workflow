create extension if not exists "pgcrypto";

create table if not exists public.workflow_roles (
  workflow_id uuid primary key default gen_random_uuid(),
  workflow_name text not null unique,
  workflow_description text,
  workflow_created_at timestamptz not null default now(),
  workflow_updated_at timestamptz not null default now(),
  workflow_deleted_at timestamptz
);

create table if not exists public.workflow_permissions (
  workflow_id uuid primary key default gen_random_uuid(),
  workflow_key text not null unique,
  workflow_group text not null,
  workflow_description text,
  workflow_created_at timestamptz not null default now()
);

create table if not exists public.workflow_role_permissions (
  workflow_role_id uuid not null references public.workflow_roles(workflow_id),
  workflow_permission_id uuid not null references public.workflow_permissions(workflow_id),
  workflow_created_at timestamptz not null default now(),
  constraint workflow_pk_role_permissions primary key (workflow_role_id, workflow_permission_id)
);

create table if not exists public.workflow_users (
  workflow_id uuid primary key default gen_random_uuid(),
  workflow_auth_user_id uuid unique,
  workflow_email text not null unique,
  workflow_full_name text not null,
  workflow_role text not null default 'viewer',
  workflow_department text,
  workflow_role_id uuid references public.workflow_roles(workflow_id),
  workflow_mfa_enabled boolean not null default false,
  workflow_last_seen_at timestamptz,
  workflow_created_at timestamptz not null default now(),
  workflow_updated_at timestamptz not null default now(),
  workflow_deleted_at timestamptz,
  constraint workflow_chk_user_role check (workflow_role in ('admin', 'designer', 'viewer'))
);

create table if not exists public.workflow_applications (
  workflow_id uuid primary key default gen_random_uuid(),
  workflow_name text not null,
  workflow_description text,
  workflow_department text not null,
  workflow_objective text not null,
  workflow_status text not null default 'draft',
  workflow_json_definition jsonb not null default '{}'::jsonb,
  workflow_created_by uuid references public.workflow_users(workflow_id),
  workflow_created_at timestamptz not null default now(),
  workflow_updated_at timestamptz not null default now(),
  workflow_deleted_at timestamptz,
  constraint workflow_chk_application_status check (workflow_status in ('draft', 'ready', 'in_review', 'approved', 'archived'))
);

create table if not exists public.workflow_workflows (
  workflow_id uuid primary key default gen_random_uuid(),
  workflow_application_id uuid not null references public.workflow_applications(workflow_id),
  workflow_json_definition jsonb not null,
  workflow_version integer not null default 1,
  workflow_created_at timestamptz not null default now(),
  workflow_updated_at timestamptz not null default now()
);

create table if not exists public.workflow_personas (
  workflow_id uuid primary key default gen_random_uuid(),
  workflow_application_id uuid not null references public.workflow_applications(workflow_id),
  workflow_json_definition jsonb not null,
  workflow_created_at timestamptz not null default now()
);

create table if not exists public.workflow_data_models (
  workflow_id uuid primary key default gen_random_uuid(),
  workflow_application_id uuid not null references public.workflow_applications(workflow_id),
  workflow_json_definition jsonb not null,
  workflow_created_at timestamptz not null default now()
);

create table if not exists public.workflow_integrations (
  workflow_id uuid primary key default gen_random_uuid(),
  workflow_application_id uuid not null references public.workflow_applications(workflow_id),
  workflow_json_definition jsonb not null,
  workflow_created_at timestamptz not null default now()
);

create table if not exists public.workflow_mvp_plans (
  workflow_id uuid primary key default gen_random_uuid(),
  workflow_application_id uuid not null references public.workflow_applications(workflow_id),
  workflow_json_definition jsonb not null,
  workflow_created_at timestamptz not null default now()
);

create table if not exists public.workflow_app_previews (
  workflow_id uuid primary key default gen_random_uuid(),
  workflow_application_id uuid not null references public.workflow_applications(workflow_id),
  workflow_preview_json jsonb not null,
  workflow_version integer not null default 1,
  workflow_runtime_state jsonb not null default '{}'::jsonb,
  workflow_created_at timestamptz not null default now(),
  workflow_updated_at timestamptz not null default now()
);

create table if not exists public.workflow_notifications (
  workflow_id uuid primary key default gen_random_uuid(),
  workflow_user_id uuid references public.workflow_users(workflow_id),
  workflow_title text not null,
  workflow_body text not null,
  workflow_read_at timestamptz,
  workflow_created_at timestamptz not null default now()
);

create table if not exists public.workflow_notification_preferences (
  workflow_id uuid primary key default gen_random_uuid(),
  workflow_user_id uuid not null references public.workflow_users(workflow_id),
  workflow_channel text not null,
  workflow_enabled boolean not null default true,
  workflow_created_at timestamptz not null default now(),
  constraint workflow_chk_notification_channel check (workflow_channel in ('in_app', 'email'))
);

create table if not exists public.workflow_documents (
  workflow_id uuid primary key default gen_random_uuid(),
  workflow_application_id uuid references public.workflow_applications(workflow_id),
  workflow_name text not null,
  workflow_storage_path text not null,
  workflow_mime_type text not null,
  workflow_size_bytes bigint not null,
  workflow_version integer not null default 1,
  workflow_scan_status text not null default 'pending',
  workflow_created_at timestamptz not null default now(),
  workflow_deleted_at timestamptz,
  constraint workflow_chk_scan_status check (workflow_scan_status in ('pending', 'clean', 'quarantined', 'failed'))
);

create table if not exists public.workflow_attachments (
  workflow_id uuid primary key default gen_random_uuid(),
  workflow_document_id uuid not null references public.workflow_documents(workflow_id),
  workflow_entity_name text not null,
  workflow_entity_id uuid not null,
  workflow_created_at timestamptz not null default now()
);

create table if not exists public.workflow_activities (
  workflow_id uuid primary key default gen_random_uuid(),
  workflow_application_id uuid references public.workflow_applications(workflow_id),
  workflow_user_id uuid references public.workflow_users(workflow_id),
  workflow_action text not null,
  workflow_description text not null,
  workflow_metadata jsonb not null default '{}'::jsonb,
  workflow_created_at timestamptz not null default now()
);

create table if not exists public.workflow_audit_logs (
  workflow_id uuid primary key default gen_random_uuid(),
  workflow_user_id uuid references public.workflow_users(workflow_id),
  workflow_timestamp timestamptz not null default now(),
  workflow_ip_address inet,
  workflow_browser text,
  workflow_action text not null,
  workflow_entity_name text,
  workflow_entity_id uuid,
  workflow_previous_values jsonb,
  workflow_new_values jsonb,
  workflow_outcome text not null default 'success',
  workflow_correlation_id uuid not null default gen_random_uuid()
);

create table if not exists public.workflow_settings (
  workflow_id uuid primary key default gen_random_uuid(),
  workflow_key text not null unique,
  workflow_value jsonb not null,
  workflow_group text not null,
  workflow_is_sensitive boolean not null default false,
  workflow_updated_by uuid references public.workflow_users(workflow_id),
  workflow_updated_at timestamptz not null default now()
);

create index if not exists workflow_idx_applications_status on public.workflow_applications(workflow_status);
create index if not exists workflow_idx_applications_created_at on public.workflow_applications(workflow_created_at desc);
create index if not exists workflow_idx_audit_timestamp on public.workflow_audit_logs(workflow_timestamp desc);
create index if not exists workflow_idx_notifications_user_read on public.workflow_notifications(workflow_user_id, workflow_read_at);
create index if not exists workflow_idx_activities_application on public.workflow_activities(workflow_application_id, workflow_created_at desc);

alter table public.workflow_roles enable row level security;
alter table public.workflow_permissions enable row level security;
alter table public.workflow_role_permissions enable row level security;
alter table public.workflow_users enable row level security;
alter table public.workflow_applications enable row level security;
alter table public.workflow_workflows enable row level security;
alter table public.workflow_personas enable row level security;
alter table public.workflow_data_models enable row level security;
alter table public.workflow_integrations enable row level security;
alter table public.workflow_mvp_plans enable row level security;
alter table public.workflow_app_previews enable row level security;
alter table public.workflow_notifications enable row level security;
alter table public.workflow_notification_preferences enable row level security;
alter table public.workflow_documents enable row level security;
alter table public.workflow_attachments enable row level security;
alter table public.workflow_activities enable row level security;
alter table public.workflow_audit_logs enable row level security;
alter table public.workflow_settings enable row level security;

alter table public.workflow_users add column if not exists workflow_role text not null default 'viewer';
alter table public.workflow_users add column if not exists workflow_department text;
alter table public.workflow_users drop constraint if exists workflow_chk_user_role;
alter table public.workflow_users add constraint workflow_chk_user_role check (workflow_role in ('admin', 'designer', 'viewer'));

drop policy if exists workflow_policy_users_select_own on public.workflow_users;
drop policy if exists workflow_policy_applications_select_authenticated on public.workflow_applications;
drop policy if exists workflow_policy_applications_insert_authenticated on public.workflow_applications;
drop policy if exists workflow_policy_activities_select_authenticated on public.workflow_activities;
drop policy if exists workflow_policy_activities_insert_authenticated on public.workflow_activities;
drop policy if exists workflow_policy_audit_select_admin on public.workflow_audit_logs;

create policy workflow_policy_users_select_own on public.workflow_users
  for select to authenticated
  using (workflow_auth_user_id = auth.uid());

create policy workflow_policy_applications_select_authenticated on public.workflow_applications
  for select to authenticated
  using (workflow_deleted_at is null);

create policy workflow_policy_applications_insert_authenticated on public.workflow_applications
  for insert to authenticated
  with check (workflow_created_by in (
    select workflow_id from public.workflow_users where workflow_auth_user_id = auth.uid() and workflow_role in ('admin', 'designer')
  ));

create policy workflow_policy_activities_select_authenticated on public.workflow_activities
  for select to authenticated
  using (true);

create policy workflow_policy_activities_insert_authenticated on public.workflow_activities
  for insert to authenticated
  with check (workflow_user_id in (
    select workflow_id from public.workflow_users where workflow_auth_user_id = auth.uid()
  ));

create policy workflow_policy_audit_select_admin on public.workflow_audit_logs
  for select to authenticated
  using (exists (
    select 1 from public.workflow_users where workflow_auth_user_id = auth.uid() and workflow_role = 'admin'
  ));
