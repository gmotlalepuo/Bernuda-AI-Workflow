import { ArrowRight, Bell, Bot, Check, FileCheck2, GitBranch, Layers3, LockKeyhole, Network, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Badge, Card } from "@/components/ui";
import { SiteHeader } from "@/components/site-header";
import { LoadingLink } from "@/components/loading-link";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function Home() {
  const admin = createAdminClient();
  const [workflowsResult, workflowCountResult, reviewCountResult, approvedCountResult] = await Promise.all([
    admin
      .from("workflow_applications")
      .select("workflow_id, workflow_name, workflow_department, workflow_status, workflow_objective, workflow_created_at")
      .is("workflow_deleted_at", null)
      .order("workflow_created_at", { ascending: false })
      .limit(3),
    admin.from("workflow_applications").select("workflow_id", { count: "exact", head: true }).is("workflow_deleted_at", null),
    admin.from("workflow_applications").select("workflow_id", { count: "exact", head: true }).eq("workflow_status", "in_review").is("workflow_deleted_at", null),
    admin.from("workflow_applications").select("workflow_id", { count: "exact", head: true }).eq("workflow_status", "approved").is("workflow_deleted_at", null)
  ]);
  const workflows = workflowsResult.data ?? [];
  const workflowCount = workflowCountResult.count ?? 0;
  const reviewCount = reviewCountResult.count ?? 0;
  const approvedCount = approvedCountResult.count ?? 0;

  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero">
          <div className="hero-orb hero-orb-one" />
          <div className="hero-orb hero-orb-two" />
          <div className="container hero-grid">
            <div className="hero-copy">
              <Badge tone="cyan"><Sparkles size={14} /> AI-native system design</Badge>
              <h1>Turn business ideas into <span>executable previews.</span></h1>
              <p>Bernuda helps enterprise teams move from requirements to workflow logic, personas, data models, integrations, MVP scope, and interactive app previews before production development begins.</p>
              <div className="hero-actions">
                <LoadingLink href="/login" className="button button-primary button-large">Sign in to portal <ArrowRight size={18} /></LoadingLink>
                <LoadingLink href="/register" className="button button-secondary button-large">Request access</LoadingLink>
              </div>
              <div className="trust-row">
                <span><Check /> {workflowCount} live workflows</span>
                <span><ShieldCheck /> {reviewCount} in review</span>
                <span><LockKeyhole /> {approvedCount} approved</span>
              </div>
            </div>
            <div className="hero-visual">
              <div className="match-window">
                <div className="window-top">
                  <span className="avatar"><GitBranch size={18} /></span>
                  <div><small>Executable preview readiness</small><strong>{workflows[0]?.workflow_name ?? "No workflow yet"}</strong></div>
                  <Bell size={19} />
                </div>
                <div className="match-highlight">
                  <div className="match-ring"><span>{approvedCount}<small> approved</small></span><em>live</em></div>
                  <div>
                    <Badge tone="cyan">Simulation live</Badge>
                    <h3>{workflows[0]?.workflow_department ?? "No department yet"}</h3>
                    <p>{workflows[0]?.workflow_objective ?? "Create a workflow from the designer portal to populate this view."}</p>
                  </div>
                </div>
                <div className="skill-list">
                  <span><Check /> Live Supabase data</span>
                  <span><Check /> Role-aware portals</span>
                  <span><Check /> Workflow transitions</span>
                </div>
                <LoadingLink href="/login" className="button button-primary">Open secure workspace <ArrowRight size={16} /></LoadingLink>
              </div>
              <div className="float-card float-one"><Bot /><span><strong>Agent orchestration</strong><small>Workflow, persona, MVP</small></span></div>
              <div className="float-card float-two"><FileCheck2 /><span><strong>Preview generated</strong><small>Clickable simulation</small></span></div>
            </div>
          </div>
        </section>

        <section className="section" id="how">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow">Simple by design</span>
              <h2>From requirement to running preview</h2>
              <p>Bernuda replaces static BRDs with a structured system design that stakeholders can inspect, click, test, and refine using live workflow records.</p>
            </div>
            <div className="steps-grid">
              {[
                [Users, "01", "Capture the business idea", "Describe the department, objective, actors, constraints, and success metrics."],
                [GitBranch, "02", "Generate system intelligence", "AI agents produce workflow logic, personas, schema, integrations, and MVP scope."],
                [Layers3, "03", "Run the app preview", "Stakeholders experience role-specific screens and simulated business behavior."]
              ].map(([Icon, n, title, detail]) => {
                const I = Icon as typeof Users;
                return (
                  <Card className="step-card" key={String(n)}>
                    <span className="step-number">{String(n)}</span>
                    <div className="icon-tile"><I /></div>
                    <h3>{String(title)}</h3>
                    <p>{String(detail)}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section tint" id="features">
          <div className="container feature-split">
            <div>
              <span className="eyebrow">Enterprise workflow builder</span>
              <h2>Everything a team needs before build begins.</h2>
              <p className="lead">The portal gives admins, designers, and viewers different workspaces so governance, creation, and review stay cleanly separated.</p>
              <div className="feature-list">
                {[
                  [Network, "Workflow engine", "Conditional branching, parallel steps, approvals, and automation nodes."],
                  [ShieldCheck, "Persona and RBAC model", "Different preview surfaces for admins, designers, reviewers, and business users."],
                  [FileCheck2, "Supabase-ready data design", "Schema definitions, audit trails, settings, documents, and notifications."],
                  [Bot, "AI orchestration boundary", "A clean place to integrate Ollama/Qwen or another model gateway."]
                ].map(([Icon, title, detail]) => {
                  const I = Icon as typeof Network;
                  return <div className="feature-item" key={String(title)}><div className="icon-tile small"><I /></div><div><h3>{String(title)}</h3><p>{String(detail)}</p></div></div>;
                })}
              </div>
            </div>
            <div className="job-stack">
              {workflows.length === 0 ? (
                <Card className="job-preview">
                  <div className="job-logo">B</div>
                  <div className="job-main">
                    <div><Badge tone="gray">No data</Badge><h3>Create the first workflow</h3><p>Open the designer portal to persist real workflow records.</p><small>Nothing has been seeded yet.</small></div>
                    <div className="match-pill"><strong>0</strong><span>live</span></div>
                  </div>
                </Card>
              ) : workflows.map((item) => (
                <Card className="job-preview" key={item.workflow_id}>
                  <div className="job-logo">B</div>
                  <div className="job-main">
                    <div><Badge tone="gray">{item.workflow_status}</Badge><h3>{item.workflow_name}</h3><p>{item.workflow_department}</p><small>{item.workflow_objective}</small></div>
                    <div className="match-pill"><strong>{new Date(item.workflow_created_at).toLocaleDateString()}</strong><span>created</span></div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="security">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow">Governed access</span>
              <h2>Production access starts with administrators.</h2>
              <p>Accounts are created by admins, protected by Supabase Auth, and routed into the correct portal based on role.</p>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="container cta-box">
            <div>
              <span className="eyebrow light">Bernuda portal</span>
              <h2>Ready to turn requirements into something stakeholders can use?</h2>
              <p>Sign in with an administrator-created account to open your workspace.</p>
            </div>
            <LoadingLink href="/login" className="button button-light button-large">Open portal <ArrowRight /></LoadingLink>
          </div>
        </section>
      </main>
      <footer>
        <div className="container footer-inner"><div><strong>BERNUDA</strong><p>AI Workflow Builder.</p></div><p>Built for enterprise system design. © 2026 Bernuda.</p></div>
      </footer>
    </>
  );
}
