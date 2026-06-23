import { Suspense } from "react";
import { Check } from "lucide-react";
import { Logo } from "@/components/logo";
import { LoginForm } from "@/components/login-form";

export default function Login() {
  return (
    <main className="auth-layout">
      <section className="auth-brand">
        <Logo />
        <div>
          <span className="eyebrow light">Welcome back</span>
          <h1>Your system previews kept their state.</h1>
          <p>Pick up where your team left off: workflows, personas, schema decisions, and executable previews are waiting.</p>
          <span><Check /> Role-specific portal routing</span>
          <span><Check /> Secure Supabase Auth session</span>
          <span><Check /> Audit-ready workflow workspace</span>
        </div>
        <small>Reimagine. Simulate. Evolve.</small>
      </section>
      <section className="auth-form-wrap">
        <Suspense fallback={<div className="auth-form"><p>Loading secure sign-in...</p></div>}>
          <LoginForm />
        </Suspense>
      </section>
    </main>
  );
}
