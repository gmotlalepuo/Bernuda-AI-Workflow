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
