import { Activity, Eye, GitBranch, ShieldCheck, Zap } from "lucide-react";
import { Badge, Card } from "@/components/ui";
import { requireUser } from "@/lib/auth";

export default async function ViewerPortal() {
  const { supabase } = await requireUser(["admin", "designer", "viewer"]);
  const [{ data: applications }, { data: activities }] = await Promise.all([
    supabase.from("workflow_applications").select("workflow_id, workflow_name, workflow_department, workflow_status, workflow_objective, workflow_created_at").is("workflow_deleted_at", null).order("workflow_created_at", { ascending: false }).limit(12),
    supabase.from("workflow_activities").select("workflow_id, workflow_action, workflow_description, workflow_created_at").order("workflow_created_at", { ascending: false }).limit(8)
  ]);

  return (
    <div className="portal-page">
      <div className="page-heading">
        <div><span className="overline">Viewer portal</span><h1>Review generated systems without editing them.</h1><p>Stakeholders can inspect application blueprints, preview readiness, and recent workflow activity.</p></div>
      </div>
      <div className="mini-stats">
        <Card><Eye /><div><strong>{applications?.length ?? 0}</strong><span>Visible blueprints</span></div></Card>
        <Card><Zap /><div><strong>Preview</strong><span>Execution layer</span></div></Card>
        <Card><ShieldCheck /><div><strong>Read-only</strong><span>Viewer access</span></div></Card>
        <Card><Activity /><div><strong>{activities?.length ?? 0}</strong><span>Recent events</span></div></Card>
      </div>
      <section className="dashboard-grid" id="previews">
        <Card className="table-card">
          <div className="table-toolbar"><h2>Application previews</h2><Badge tone="cyan">Role-safe</Badge></div>
          {(applications ?? []).length === 0 ? <div className="empty-state">No application blueprints are available for review yet.</div> : applications?.map((app) => (
            <div className="application-row" key={app.workflow_id}>
              <span className="spark-icon"><GitBranch /></span>
              <div><strong>{app.workflow_name}</strong><small>{app.workflow_department} · {app.workflow_objective}</small></div>
              <Badge tone={app.workflow_status === "approved" ? "green" : "amber"}>{app.workflow_status}</Badge>
            </div>
          ))}
        </Card>
        <Card className="table-card" id="audit">
          <div className="table-toolbar"><h2>Recent activity</h2><Badge tone="gray">Timeline</Badge></div>
          {(activities ?? []).length === 0 ? <div className="empty-state">No workflow activity yet.</div> : activities?.map((activity) => (
            <div className="application-row" key={activity.workflow_id}>
              <span className="spark-icon"><Activity /></span>
              <div><strong>{activity.workflow_action}</strong><small>{activity.workflow_description} · {new Date(activity.workflow_created_at).toLocaleString()}</small></div>
              <Badge tone="blue">event</Badge>
            </div>
          ))}
        </Card>
      </section>
    </div>
  );
}
