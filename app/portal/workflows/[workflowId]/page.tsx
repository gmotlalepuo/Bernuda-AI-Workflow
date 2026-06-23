import { Badge, Card } from "@/components/ui";
import { WorkflowTransitionActions } from "@/components/workflow-transition-actions";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { CalendarDays, Database, GitBranch, ListChecks, MessageSquareText, ShieldCheck, UserRound } from "lucide-react";

function JsonBlock({ value }: { value: unknown }) {
  return <pre className="code-block">{JSON.stringify(value, null, 2)}</pre>;
}

export default async function WorkflowDetailPage({ params }: { params: { workflowId: string } }) {
  const { profile } = await requireUser(["admin", "designer", "viewer"]);
  const admin = createAdminClient();

  const { data: workflow } = await admin.from("workflow_applications").select("*").eq("workflow_id", params.workflowId).maybeSingle();

  if (!workflow) {
    return (
      <div className="portal-page">
        <Card className="builder-panel">
          <h1>Workflow not found</h1>
          <p className="muted">This workflow may have been deleted or is still being created.</p>
        </Card>
      </div>
    );
  }

  const [
    { data: workflowRun },
    { data: personas },
    { data: models },
    { data: integrations },
    { data: mvpPlans },
    { data: preview },
    { data: activities },
    { data: creator }
  ] = await Promise.all([
    admin.from("workflow_workflows").select("*").eq("workflow_application_id", params.workflowId).order("workflow_created_at", { ascending: false }).limit(1).maybeSingle(),
    admin.from("workflow_personas").select("*").eq("workflow_application_id", params.workflowId).order("workflow_created_at", { ascending: false }).limit(1).maybeSingle(),
    admin.from("workflow_data_models").select("*").eq("workflow_application_id", params.workflowId).order("workflow_created_at", { ascending: false }).limit(1).maybeSingle(),
    admin.from("workflow_integrations").select("*").eq("workflow_application_id", params.workflowId).order("workflow_created_at", { ascending: false }).limit(1).maybeSingle(),
    admin.from("workflow_mvp_plans").select("*").eq("workflow_application_id", params.workflowId).order("workflow_created_at", { ascending: false }).limit(1).maybeSingle(),
    admin.from("workflow_app_previews").select("*").eq("workflow_application_id", params.workflowId).order("workflow_created_at", { ascending: false }).limit(1).maybeSingle(),
    admin.from("workflow_activities").select("*").eq("workflow_application_id", params.workflowId).order("workflow_created_at", { ascending: false }).limit(6),
    workflow.workflow_created_by
      ? admin.from("workflow_users").select("workflow_full_name").eq("workflow_id", workflow.workflow_created_by).maybeSingle()
      : Promise.resolve({ data: null })
  ]);

  const sections = [
    { label: "Workflow", value: workflowRun?.workflow_json_definition ?? { message: "No workflow definition stored yet." } },
    { label: "Personas", value: personas?.workflow_json_definition ?? { personas: [] } },
    { label: "Data models", value: models?.workflow_json_definition ?? { models: [] } },
    { label: "Integrations", value: integrations?.workflow_json_definition ?? { integrations: [] } },
    { label: "MVP plan", value: mvpPlans?.workflow_json_definition ?? { plan: [] } },
    { label: "Preview runtime", value: preview?.workflow_preview_json ?? { pages: [] } }
  ];

  return (
    <div className="portal-page">
      <div className="page-heading">
        <div>
          <span className="overline">Workflow detail</span>
          <h1>{workflow.workflow_name}</h1>
          <p>{workflow.workflow_department} · {workflow.workflow_status} · Created by {creator?.workflow_full_name ?? "Unknown"}</p>
        </div>
        <Badge tone={workflow.workflow_status === "approved" ? "green" : workflow.workflow_status === "archived" ? "gray" : "amber"}>{workflow.workflow_status}</Badge>
      </div>

      <Card className="profile-callout">
        <div className="completion-ring"><span>{workflow.workflow_status === "approved" ? "100" : workflow.workflow_status === "in_review" ? "72" : "56"}%</span></div>
        <div>
          <span className="overline">Objective</span>
          <h2>{workflow.workflow_objective}</h2>
          <p>Use the action buttons to move this workflow from draft to review, approval, and archive.</p>
        </div>
      </Card>

      <section className="dashboard-grid" style={{ marginTop: 16 }}>
        <Card className="builder-panel">
          <div className="table-toolbar">
            <h2>Workflow actions</h2>
            <Badge tone="cyan">Live update</Badge>
          </div>
          <WorkflowTransitionActions workflowId={workflow.workflow_id} currentStatus={workflow.workflow_status} role={profile.workflow_role} />
          <div className="readiness-row"><UserRound /><span><strong>Created by</strong><small>{creator?.workflow_full_name ?? "Unknown"}</small></span></div>
          <div className="readiness-row"><CalendarDays /><span><strong>Created at</strong><small>{new Date(workflow.workflow_created_at).toLocaleString()}</small></span></div>
          <div className="readiness-row"><ShieldCheck /><span><strong>Access</strong><small>{profile.workflow_role} portal</small></span></div>
        </Card>
        <Card className="readiness-panel">
          <span className="spark-icon"><GitBranch /></span>
          <h2>Blueprint snapshot</h2>
          <p>Latest persisted workflow records from Supabase.</p>
          <div className="readiness-row"><Database /><span><strong>{sections.length}</strong><small>Generated artifact groups</small></span></div>
          <div className="readiness-row"><ListChecks /><span><strong>{activities?.length ?? 0}</strong><small>Recent activities</small></span></div>
        </Card>
      </section>

      <section className="section grid cols-2">
        {sections.map((section) => (
          <Card className="table-card" key={section.label}>
            <div className="table-toolbar">
              <h2>{section.label}</h2>
              <Badge tone="gray">live</Badge>
            </div>
            <JsonBlock value={section.value} />
          </Card>
        ))}
      </section>

      <Card className="table-card" style={{ marginTop: 16 }}>
        <div className="table-toolbar">
          <h2>Recent activity</h2>
          <Badge tone="blue">timeline</Badge>
        </div>
        {(activities ?? []).length === 0 ? (
          <div className="empty-state">No workflow activity recorded yet.</div>
        ) : activities?.map((activity) => (
          <div className="application-row" key={activity.workflow_id}>
            <span className="spark-icon"><MessageSquareText /></span>
            <div>
              <strong>{activity.workflow_action}</strong>
              <small>{activity.workflow_description} · {new Date(activity.workflow_created_at).toLocaleString()}</small>
            </div>
            <Badge tone="green">logged</Badge>
          </div>
        ))}
      </Card>
    </div>
  );
}
