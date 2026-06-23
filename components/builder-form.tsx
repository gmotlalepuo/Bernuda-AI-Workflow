"use client";

import { useEffect, useMemo, useState } from "react";
import { Play, Save, WandSparkles } from "lucide-react";
import { builderRequestSchema, type BuilderRequest } from "@/lib/validation";

const draftKey = "workflow_bernuda_builder_draft";

export function BuilderForm() {
  const [form, setForm] = useState<BuilderRequest>(() => {
    if (typeof window !== "undefined") {
      const existing = window.localStorage.getItem(draftKey);
      if (existing) {
        return JSON.parse(existing) as BuilderRequest;
      }
    }

    return {
      name: "Loan Approval Preview",
      department: "Retail Banking",
      objective: "Generate an executable application preview with role-based views, validation rules, and approval workflow simulation.",
      mode: "designer"
    };
  });
  const [saved, setSaved] = useState(false);
  const validation = useMemo(() => builderRequestSchema.safeParse(form), [form]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      window.localStorage.setItem(draftKey, JSON.stringify(form));
      setSaved(true);
    }, 600);
    return () => window.clearTimeout(id);
  }, [form]);

  return (
    <form className="form-grid" aria-label="Application builder">
      <div className="field">
        <label htmlFor="workflow_name">Application name *</label>
        <input id="workflow_name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
      </div>
      <div className="grid cols-2">
        <div className="field">
          <label htmlFor="workflow_department">Department *</label>
          <input id="workflow_department" value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} required />
        </div>
        <div className="field">
          <label htmlFor="workflow_mode">Preview mode *</label>
          <select id="workflow_mode" value={form.mode} onChange={(event) => setForm({ ...form, mode: event.target.value as BuilderRequest["mode"] })}>
            <option value="designer">Designer</option>
            <option value="business">Business</option>
            <option value="executive">Executive</option>
            <option value="testing">Testing</option>
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor="workflow_objective">Business objective *</label>
        <textarea id="workflow_objective" value={form.objective} onChange={(event) => setForm({ ...form, objective: event.target.value })} required />
      </div>
      {!validation.success ? (
        <div role="alert" className="toast" style={{ borderColor: "rgba(180,35,24,.28)", background: "rgba(180,35,24,.08)", color: "var(--danger)" }}>
          {validation.error.issues[0]?.message}
        </div>
      ) : null}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <button className="button primary" type="button" disabled={!validation.success}>
          <WandSparkles size={18} />
          Generate blueprint
        </button>
        <button className="button" type="button">
          <Play size={18} />
          Run simulation
        </button>
        <button className="button" type="button">
          <Save size={18} />
          Save draft
        </button>
      </div>
      {saved ? <div className="toast" aria-live="polite">Draft autosaved locally. Server persistence is ready for Supabase.</div> : null}
    </form>
  );
}
