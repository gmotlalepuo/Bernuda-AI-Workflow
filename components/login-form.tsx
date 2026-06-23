"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { portalPathForRole, type WorkflowRole } from "@/lib/roles";

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const reason = search.get("error");
  const initialError = reason === "not_invited"
    ? "This account is not assigned to Bernuda yet. Ask an administrator to create your portal user."
    : reason === "configuration"
      ? "Authentication is not configured on this server."
      : reason
        ? "Your session could not be loaded. Please sign in again."
        : "";
  const [error, setError] = useState(initialError);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      const { data: profile, error: profileError } = await supabase
        .from("workflow_users")
        .select("workflow_role")
        .eq("workflow_auth_user_id", data.user.id)
        .is("workflow_deleted_at", null)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile) {
        await supabase.auth.signOut();
        throw new Error("This account has no Bernuda portal role. Ask an administrator to assign access.");
      }

      const role = profile.workflow_role as WorkflowRole;
      const next = search.get("next");
      router.replace(next?.startsWith("/portal") ? next : portalPathForRole(role));
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <h1>Sign in to Bernuda</h1>
      <p>Need access? <Link href="/register">Request an administrator-created account</Link></p>
      <label>Email address
        <div className="input-wrap"><Mail /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required /></div>
      </label>
      <label>Password
        <div className="input-wrap"><LockKeyhole /><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" autoComplete="current-password" required /></div>
      </label>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <div className="form-between"><span /> <Link href="/forgot-password">Forgot password?</Link></div>
      <button className="button button-primary auth-submit" disabled={loading}>{loading ? <><span className="button-spinner" /> Signing in</> : <>Sign in <ArrowRight /></>}</button>
      <small>Access is role-based and managed by Bernuda administrators.</small>
    </form>
  );
}
