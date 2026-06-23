"use client";

import { FormEvent, useState } from "react";
import { Sparkles } from "lucide-react";

export function ApplicationBuilderForm() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.workflow_error ?? "Unable to save application.");
      setMessage(`Saved ${result.workflow_application.workflow_name}.`);
      form.reset();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save application.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={submit}>
      <label><span>Application name</span><input name="name" required minLength={3} placeholder="Loan Approval System" /></label>
      <label><span>Department</span><input name="department" required placeholder="Retail Banking" /></label>
      <label className="full"><span>Business objective</span><textarea name="objective" required minLength={20} placeholder="Describe the system you want Bernuda to generate..." /></label>
      <label><span>Priority</span><select name="priority" defaultValue="mvp"><option value="mvp">MVP definition</option><option value="compliance">Compliance review</option><option value="integration">Integration-first</option></select></label>
      <label><span>Preview mode</span><select name="mode" defaultValue="designer"><option value="designer">Designer</option><option value="business">Business</option><option value="executive">Executive</option><option value="testing">Testing</option></select></label>
      <div className="form-actions full"><button className="button button-primary" disabled={loading}>{loading ? <><span className="button-spinner" /> Saving</> : <><Sparkles size={17} />Save blueprint</>}</button></div>
      {message ? <p className="form-success full" role="status">{message}</p> : null}
      {error ? <p className="form-error full" role="alert">{error}</p> : null}
    </form>
  );
}
