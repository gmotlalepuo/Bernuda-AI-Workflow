import { Activity, Database, ShieldCheck, Users } from "lucide-react";
import { AdminCreateUserForm } from "@/components/admin-create-user-form";
import { LoadingLink } from "@/components/loading-link";
import { Badge, Card, Progress } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminPortal() {
  await requireUser(["admin"]);
  const supabase = createAdminClient();
  const [{ count: userCount }, { count: appCount }, { data: users }, { data: audits }] = await Promise.all([
    supabase.from("workflow_users").select("workflow_id", { count: "exact", head: true }).is("workflow_deleted_at", null),
    supabase.from("workflow_applications").select("workflow_id", { count: "exact", head: true }).is("workflow_deleted_at", null),
    supabase.from("workflow_users").select("workflow_id, workflow_full_name, workflow_email, workflow_role, workflow_department, workflow_created_at").is("workflow_deleted_at", null).order("workflow_created_at", { ascending: false }).limit(8),
    supabase.from("workflow_audit_logs").select("workflow_id, workflow_action, workflow_entity_name, workflow_outcome, workflow_timestamp").order("workflow_timestamp", { ascending: false }).limit(8)
  ]);
  const { data: workflows } = await supabase
    .from("workflow_applications")
    .select("workflow_id, workflow_name, workflow_department, workflow_status, workflow_objective, workflow_created_at")
    .is("workflow_deleted_at", null)
    .order("workflow_created_at", { ascending: false })
    .limit(6);

  return (
    <div className="portal-page">
      <div className="page-heading">
        <div><span className="overline">Admin portal</span><h1>Govern access, audit activity, and platform readiness.</h1><p>Create users, review activity, and keep Bernuda controlled by role.</p></div>
      </div>
      <div className="mini-stats">
        <Card><Users /><div><strong>{userCount ?? 0}</strong><span>Portal users</span></div></Card>
        <Card><Database /><div><strong>{appCount ?? 0}</strong><span>Applications</span></div></Card>
        <Card><ShieldCheck /><div><strong>RBAC</strong><span>Enabled</span></div></Card>
        <Card><Activity /><div><strong>Live</strong><span>Audit stream</span></div></Card>
      </div>
      <section className="dashboard-grid">
        <Card className="builder-panel" id="users">
          <div className="table-toolbar"><h2>Create administrator-managed user</h2><Badge tone="cyan">Supabase Auth</Badge></div>
          <AdminCreateUserForm />
        </Card>
        <Card className="readiness-panel">
          <span className="spark-icon"><ShieldCheck /></span>
          <h2>System readiness</h2>
          <p>Production gates for account governance and workflow persistence.</p>
          <Progress value={82} label="Access and schema readiness" />
          <div className="readiness-row"><ShieldCheck /><span><strong>Admin-only creation</strong><small>Public sign-up disabled</small></span></div>
          <div className="readiness-row"><Database /><span><strong>workflow_ schema</strong><small>Shared database collision-safe</small></span></div>
        </Card>
      </section>
      <section className="dashboard-grid" style={{ marginTop: 16 }}>
        <Card className="table-card">
          <div className="table-toolbar"><h2>Recent users</h2><Badge tone="gray">Latest 8</Badge></div>
          {(users ?? []).length === 0 ? <div className="empty-state">No workflow users yet.</div> : users?.map((user) => (
            <div className="data-row" key={user.workflow_id}>
              <span className="avatar">{user.workflow_full_name.slice(0, 2).toUpperCase()}</span>
              <div><strong>{user.workflow_full_name}</strong><small>{user.workflow_email}</small></div>
              <span>{user.workflow_role}</span>
              <span>{user.workflow_department ?? "Unassigned"}</span>
              <span>{new Date(user.workflow_created_at).toLocaleDateString()}</span>
              <Badge tone="green">active</Badge>
            </div>
          ))}
        </Card>
        <Card className="table-card" id="audit">
          <div className="table-toolbar"><h2>Audit events</h2><Badge tone="blue">Compliance</Badge></div>
          {(audits ?? []).length === 0 ? <div className="empty-state">No audit events recorded yet.</div> : audits?.map((event) => (
            <div className="application-row" key={event.workflow_id}>
              <span className="spark-icon"><Activity /></span>
              <div><strong>{event.workflow_action}</strong><small>{event.workflow_entity_name ?? "system"} · {new Date(event.workflow_timestamp).toLocaleString()}</small></div>
              <Badge tone={event.workflow_outcome === "success" ? "green" : "amber"}>{event.workflow_outcome}</Badge>
            </div>
          ))}
        </Card>
      </section>
      <Card className="table-card" style={{ marginTop: 16 }}>
        <div className="table-toolbar"><h2>Workflow blueprints</h2><Badge tone="cyan">Live data</Badge></div>
        {(workflows ?? []).length === 0 ? <div className="empty-state">No workflows available yet.</div> : workflows?.map((workflow) => (
          <div className="application-row" key={workflow.workflow_id}>
            <span className="spark-icon"><Database /></span>
            <div>
              <LoadingLink href={`/portal/workflows/${workflow.workflow_id}`} className="workflow-link"><strong>{workflow.workflow_name}</strong></LoadingLink>
              <small>{workflow.workflow_department} · {workflow.workflow_objective}</small>
            </div>
            <Badge tone={workflow.workflow_status === "approved" ? "green" : workflow.workflow_status === "in_review" ? "amber" : "gray"}>{workflow.workflow_status}</Badge>
          </div>
        ))}
      </Card>
    </div>
  );
}
