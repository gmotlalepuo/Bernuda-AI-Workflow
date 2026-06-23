"use client";

import { FormEvent, useState } from "react";
import { Mail, ShieldCheck, UserRound } from "lucide-react";

export function AdminCreateUserForm() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.workflow_error ?? "Unable to create user.");
      setMessage(`Created ${result.workflow_user.workflow_email} as ${result.workflow_user.workflow_role}.`);
      event.currentTarget.reset();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create user.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={submit}>
      <label><span>Full name</span><input name="fullName" required minLength={2} placeholder="Jane Architect" /></label>
      <label><span>Email</span><input name="email" type="email" required placeholder="jane@example.com" /></label>
      <label><span>Role</span><select name="role" required defaultValue="designer"><option value="admin">Admin</option><option value="designer">Designer</option><option value="viewer">Viewer</option></select></label>
      <label><span>Department</span><input name="department" placeholder="Operations" /></label>
      <label className="full"><span>Temporary password</span><input name="password" type="password" required minLength={8} placeholder="At least 8 characters" /></label>
      <div className="form-actions full">
        <button className="button button-primary" disabled={loading}>{loading ? <><span className="button-spinner" /> Creating</> : <><UserRound size={17} />Create user</>}</button>
      </div>
      {message ? <p className="form-success full" role="status"><Mail size={14} /> {message}</p> : null}
      {error ? <p className="form-error full" role="alert"><ShieldCheck size={14} /> {error}</p> : null}
    </form>
  );
}
