import { ArrowRight, Check } from "lucide-react";
import { Logo } from "@/components/logo";
import { LoadingLink } from "@/components/loading-link";

export default function Register() {
  return (
    <main className="auth-layout">
      <section className="auth-brand">
        <Logo />
        <div>
          <span className="eyebrow light">Admin-only access</span>
          <h1>Bernuda accounts are created by administrators.</h1>
          <p>This keeps enterprise previews, generated schemas, and audit logs governed from the first session.</p>
          <span><Check /> No public self-registration</span>
          <span><Check /> Admin assigns role and department</span>
          <span><Check /> User lands in the correct portal</span>
        </div>
        <small>Controlled access for enterprise design teams.</small>
      </section>
      <section className="auth-form-wrap">
        <div className="auth-form">
          <h1>Request access</h1>
          <p>Ask a Bernuda administrator to create your account from the Admin Portal. You will receive your login details from your organization.</p>
          <div className="form-success">
            Administrators can create users for Admin, Designer, and Viewer workspaces after signing in.
          </div>
          <div style={{ display: "grid", gap: 10, marginTop: 22 }}>
            <LoadingLink href="/login" className="button button-primary auth-submit">I already have an account <ArrowRight /></LoadingLink>
            <LoadingLink href="/" className="button button-secondary auth-submit">Return to landing page</LoadingLink>
          </div>
          <small>Public registration is intentionally disabled per the Bernuda technical documentation.</small>
        </div>
      </section>
    </main>
  );
}
