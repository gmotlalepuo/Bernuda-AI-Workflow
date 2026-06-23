import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/auth";

const createUserSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["admin", "designer", "viewer"]),
  department: z.string().optional()
});

export async function POST(request: Request) {
  await requireUser(["admin"]);
  const body = await request.json().catch(() => null);
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ workflow_error: "Please provide a valid name, email, role, and password." }, { status: 422 });
  }

  const admin = createAdminClient();
  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      workflow_full_name: parsed.data.fullName,
      workflow_role: parsed.data.role
    }
  });

  if (authError || !authUser.user) {
    return NextResponse.json({ workflow_error: authError?.message ?? "Unable to create Supabase Auth user." }, { status: 400 });
  }

  const { data: workflowUser, error: profileError } = await admin
    .from("workflow_users")
    .upsert({
      workflow_auth_user_id: authUser.user.id,
      workflow_email: parsed.data.email,
      workflow_full_name: parsed.data.fullName,
      workflow_role: parsed.data.role,
      workflow_department: parsed.data.department || null,
      workflow_mfa_enabled: false
    }, { onConflict: "workflow_auth_user_id" })
    .select("workflow_id, workflow_email, workflow_full_name, workflow_role")
    .single();

  if (profileError) {
    return NextResponse.json({ workflow_error: profileError.message }, { status: 400 });
  }

  await admin.from("workflow_audit_logs").insert({
    workflow_user_id: workflowUser.workflow_id,
    workflow_action: "Admin created workflow user",
    workflow_entity_name: "workflow_users",
    workflow_entity_id: workflowUser.workflow_id,
    workflow_new_values: workflowUser,
    workflow_outcome: "success"
  });

  return NextResponse.json({ workflow_user: workflowUser });
}
