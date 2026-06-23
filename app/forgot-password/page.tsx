import { Logo } from "@/components/logo";
import { LoadingLink } from "@/components/loading-link";

export default function ForgotPassword() {
  return (
    <main className="auth-layout">
      <section className="auth-brand">
        <Logo />
        <div>
          <span className="eyebrow light">Password recovery</span>
          <h1>Use your organization’s recovery process.</h1>
          <p>Bernuda uses Supabase Auth, but account access remains administrator-governed.</p>
        </div>
        <small>Secure recovery starts with your admin.</small>
      </section>
      <section className="auth-form-wrap">
        <div className="auth-form">
          <h1>Forgot password?</h1>
          <p>Contact your Bernuda administrator to reset your password or reissue access.</p>
          <LoadingLink href="/login" className="button button-primary auth-submit">Back to sign in</LoadingLink>
        </div>
      </section>
    </main>
  );
}
