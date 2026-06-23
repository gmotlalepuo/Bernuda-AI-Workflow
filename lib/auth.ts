import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { portalPathForRole, type WorkflowRole } from "@/lib/roles";

export type WorkflowProfile = {
  workflow_id: string;
  workflow_auth_user_id: string;
  workflow_email: string;
  workflow_full_name: string;
  workflow_role: WorkflowRole;
  workflow_department: string | null;
};

export async function requireUser(allowed?: WorkflowRole[]) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");

  const { data: profile } = await supabase
    .from("workflow_users")
    .select("workflow_id, workflow_auth_user_id, workflow_email, workflow_full_name, workflow_role, workflow_department")
    .eq("workflow_auth_user_id", user.id)
    .is("workflow_deleted_at", null)
    .maybeSingle();

  if (!profile) {
    await supabase.auth.signOut();
    redirect("/login?error=not_invited");
  }

  const typedProfile = profile as WorkflowProfile;
  if (allowed && !allowed.includes(typedProfile.workflow_role)) {
    redirect(portalPathForRole(typedProfile.workflow_role));
  }

  return { supabase, user, profile: typedProfile };
}
