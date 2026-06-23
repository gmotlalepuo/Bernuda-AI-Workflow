import { AlertTriangle, CheckCircle2, Clock3, Layers3 } from "lucide-react";
import { bernudaBlueprint } from "@/lib/mock-data";
import { getPreviewCompleteness } from "@/lib/preview-engine";

const metrics = [
  { label: "Preview completeness", value: `${getPreviewCompleteness(bernudaBlueprint.preview)}%`, icon: CheckCircle2, note: "Executable pages and logic coverage" },
  { label: "Workflow steps", value: String(bernudaBlueprint.workflowSteps.length), icon: Layers3, note: "Conditional, approval, and automation nodes" },
  { label: "Open risks", value: "4", icon: AlertTriangle, note: "Integration and policy assumptions" },
  { label: "Target render", value: "<300ms", icon: Clock3, note: "Preview execution performance goal" }
];

export function MetricCards() {
  return (
    <section className="grid cols-4" aria-label="Dashboard summary">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <article className="card metric" key={metric.label}>
            <div>
              <p className="muted">{metric.label}</p>
              <div className="metric-value">{metric.value}</div>
              <p className="muted">{metric.note}</p>
            </div>
            <Icon color="var(--primary)" size={24} aria-hidden="true" />
          </article>
        );
      })}
    </section>
  );
}
