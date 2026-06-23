"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type WorkflowAction = "submit_for_review" | "request_changes" | "approve" | "archive";

export function WorkflowTransitionActions({ workflowId, currentStatus, role }: { workflowId: string; currentStatus: string; role: "admin" | "designer" | "viewer" }) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<WorkflowAction | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const actions: Array<{ action: WorkflowAction; label: string; tone: "primary" | "secondary" | "danger"; visible: boolean }> = [
    { action: "submit_for_review", label: "Submit for review", tone: "primary", visible: currentStatus === "draft" && (role === "admin" || role === "designer") },
    { action: "request_changes", label: "Request changes", tone: "secondary", visible: currentStatus === "in_review" && role === "admin" },
    { action: "approve", label: "Approve", tone: "primary", visible: currentStatus === "in_review" && role === "admin" },
    { action: "archive", label: "Archive", tone: "danger", visible: currentStatus !== "archived" && role === "admin" }
  ];

  async function transition(action: WorkflowAction) {
    setError("");
    setMessage("");
    setLoadingAction(action);
    try {
      const response = await fetch(`/api/workflows/${workflowId}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.workflow_error ?? "Unable to update workflow.");
      setMessage(result.workflow_message);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update workflow.");
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <div className="workflow-actions">
      {actions.filter((item) => item.visible).map((item) => (
        <button
          key={item.action}
          type="button"
          className={`button button-${item.tone}`}
          disabled={loadingAction !== null}
          onClick={() => transition(item.action)}
        >
          {loadingAction === item.action ? <><span className="button-spinner" /> Working</> : item.label}
        </button>
      ))}
      {message ? <p className="form-success full" role="status">{message}</p> : null}
      {error ? <p className="form-error full" role="alert">{error}</p> : null}
    </div>
  );
}
