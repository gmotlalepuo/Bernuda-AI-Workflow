import { ArrowRight } from "lucide-react";
import type { WorkflowStep } from "@/lib/types";

export function WorkflowMap({ steps }: { steps: WorkflowStep[] }) {
  return (
    <div className="workflow">
      {steps.map((step, index) => (
        <article className="step" key={step.id}>
          <div className="step-index">{index + 1}</div>
          <div>
            <h3>{step.title}</h3>
            <p className="muted">{step.description}</p>
            <span className="muted">Owner: {step.ownerRole}</span>
          </div>
          <span className="badge">
            {step.type}
            {step.next.length > 0 ? <ArrowRight size={14} aria-hidden="true" /> : null}
          </span>
        </article>
      ))}
    </div>
  );
}
