import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/auth";

const transitionSchema = z.object({
  action: z.enum(["submit_for_review", "request_changes", "approve", "archive"])
});

const actionToStatus: Record<string, string> = {
  submit_for_review: "in_review",
  request_changes: "draft",
  approve: "approved",
  archive: "archived"
};

export async function POST(request: Request, { params }: { params: Promise<{ workflowId: string }> }) {
  const { profile } = await requireUser(["admin", "designer"]);
  const body = await request.json().catch(() => null);
  const parsed = transitionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ workflow_error: "Choose a valid workflow action." }, { status: 422 });
  }

  const { workflowId } = await params;

  const admin = createAdminClient();
  const { data: workflow, error: workflowError } = await admin
    .from("workflow_applications")
    .select("workflow_id, workflow_name, workflow_status, workflow_department, workflow_objective, workflow_created_by")
    .eq("workflow_id", workflowId)
    .maybeSingle();

  if (workflowError || !workflow) {
    return NextResponse.json({ workflow_error: "Workflow not found." }, { status: 404 });
  }

  const action = parsed.data.action;
  const currentStatus = workflow.workflow_status;
  const role = profile.workflow_role;

  if (action === "submit_for_review" && currentStatus !== "draft") {
    return NextResponse.json({ workflow_error: "Only draft workflows can be submitted for review." }, { status: 400 });
  }
  if (action === "request_changes" && currentStatus !== "in_review") {
    return NextResponse.json({ workflow_error: "Only workflows in review can be moved back to draft." }, { status: 400 });
  }
  if (action === "approve" && currentStatus !== "in_review") {
    return NextResponse.json({ workflow_error: "Only workflows in review can be approved." }, { status: 400 });
  }
  if (action === "archive" && currentStatus === "draft") {
    return NextResponse.json({ workflow_error: "Draft workflows should be reviewed before archiving." }, { status: 400 });
  }

  if (action === "approve" && role !== "admin") {
    return NextResponse.json({ workflow_error: "Only admins can approve workflows." }, { status: 403 });
  }
  if (action === "archive" && role !== "admin") {
    return NextResponse.json({ workflow_error: "Only admins can archive workflows." }, { status: 403 });
  }

  const nextStatus = actionToStatus[action];
  const { data: updated, error: updateError } = await admin
    .from("workflow_applications")
    .update({
      workflow_status: nextStatus,
      workflow_updated_at: new Date().toISOString()
    })
    .eq("workflow_id", workflow.workflow_id)
    .select("workflow_id, workflow_name, workflow_status, workflow_updated_at")
    .single();

  if (updateError) {
    return NextResponse.json({ workflow_error: updateError.message }, { status: 400 });
  }

  await Promise.all([
    admin.from("workflow_activities").insert({
      workflow_application_id: workflow.workflow_id,
      workflow_user_id: profile.workflow_id,
      workflow_action: `Workflow ${action.replaceAll("_", " ")}`,
      workflow_description: `${profile.workflow_full_name} moved ${workflow.workflow_name} from ${currentStatus} to ${nextStatus}`,
      workflow_metadata: { action, previous_status: currentStatus, next_status: nextStatus }
    }),
    admin.from("workflow_audit_logs").insert({
      workflow_user_id: profile.workflow_id,
      workflow_action: `Workflow ${action.replaceAll("_", " ")}`,
      workflow_entity_name: "workflow_applications",
      workflow_entity_id: workflow.workflow_id,
      workflow_previous_values: { workflow_status: currentStatus },
      workflow_new_values: { workflow_status: nextStatus },
      workflow_outcome: "success"
    })
  ]);

  return NextResponse.json({
    workflow_application: updated,
    workflow_message: `${workflow.workflow_name} is now ${nextStatus}.`
  });
}
