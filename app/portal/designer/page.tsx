import { Bot, Database, FileCheck2, GitBranch } from "lucide-react";
import { ApplicationBuilderForm } from "@/components/application-builder-form";
import { Badge, Card, Progress } from "@/components/ui";
import { requireUser } from "@/lib/auth";

export default async function DesignerPortal() {
  const { supabase } = await requireUser(["admin", "designer"]);
  const { data: applications } = await supabase
    .from("workflow_applications")
    .select("workflow_id, workflow_name, workflow_department, workflow_status, workflow_created_at")
    .is("workflow_deleted_at", null)
    .order("workflow_created_at", { ascending: false })
    .limit(10);

  return (
    <div className="portal-page">
      <div className="page-heading">
        <div><span className="overline">Designer portal</span><h1>Build workflows and executable previews.</h1><p>Create real persisted application blueprints from business requirements.</p></div>
      </div>
      <div className="profile-callout">
        <div className="completion-ring"><span>76%</span></div>
        <div><span className="overline">Preview generation pipeline</span><h2>Workflow, persona, data model, integration, MVP, and app-preview agents are staged.</h2><p>Saving a blueprint persists the real requirement record in Supabase for generation workflows.</p></div>
      </div>
      <section className="dashboard-grid" style={{ marginTop: 16 }}>
        <Card className="builder-panel" id="builder">
          <div className="table-toolbar"><h2>New application blueprint</h2><Badge tone="cyan">Persisted</Badge></div>
          <ApplicationBuilderForm />
        </Card>
        <Card className="readiness-panel">
          <span className="spark-icon"><Bot /></span>
          <h2>Agent readiness</h2>
          <p>Design assumptions from the DOCX are represented as production work queues.</p>
          <Progress value={68} label="Generation readiness" />
          <div className="readiness-row"><GitBranch /><span><strong>Workflow engine</strong><small>Conditional and approval nodes</small></span></div>
          <div className="readiness-row"><Database /><span><strong>Data model engine</strong><small>Supabase migration targets</small></span></div>
          <div className="readiness-row"><FileCheck2 /><span><strong>Preview renderer</strong><small>JSON-to-UI execution layer</small></span></div>
        </Card>
      </section>
      <Card className="table-card" style={{ marginTop: 16 }}>
        <div className="table-toolbar"><h2>Recent application blueprints</h2><Badge tone="gray">Database records</Badge></div>
        {(applications ?? []).length === 0 ? <div className="empty-state">No application blueprints yet. Create the first one above.</div> : applications?.map((app) => (
          <div className="application-row" key={app.workflow_id}>
            <span className="spark-icon"><GitBranch /></span>
            <div><strong>{app.workflow_name}</strong><small>{app.workflow_department} · {new Date(app.workflow_created_at).toLocaleString()}</small></div>
            <Badge tone={app.workflow_status === "approved" ? "green" : "amber"}>{app.workflow_status}</Badge>
          </div>
        ))}
      </Card>
    </div>
  );
}
