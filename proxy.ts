import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { portalPathForRole, type WorkflowRole } from "@/lib/roles";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return redirectToLogin(request, "configuration");

    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookies: Array<{ name: string; value: string; options: CookieOptions }>) {
          cookies.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        }
      }
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirectToLogin(request);

    const { data: profile } = await supabase
      .from("workflow_users")
      .select("workflow_role")
      .eq("workflow_auth_user_id", user.id)
      .is("workflow_deleted_at", null)
      .maybeSingle();

    if (!profile) {
      const login = new URL("/login", request.url);
      login.searchParams.set("error", "not_invited");
      return NextResponse.redirect(login);
    }

    const role = profile.workflow_role as WorkflowRole;
    const pathname = request.nextUrl.pathname;

    if (pathname === "/portal") {
      return NextResponse.redirect(new URL(portalPathForRole(role), request.url));
    }

    if (pathname.startsWith("/portal/admin") && role !== "admin") return NextResponse.redirect(new URL(portalPathForRole(role), request.url));
    if (pathname.startsWith("/portal/designer") && !["admin", "designer"].includes(role)) return NextResponse.redirect(new URL(portalPathForRole(role), request.url));

    return response;
  } catch {
    return redirectToLogin(request, "session_unavailable");
  }
}

function redirectToLogin(request: NextRequest, error?: string) {
  const login = new URL("/login", request.url);
  login.searchParams.set("next", request.nextUrl.pathname);
  if (error) login.searchParams.set("error", error);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/portal/:path*"]
};
