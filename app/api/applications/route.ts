import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { buildWorkflowBlueprint } from "@/lib/workflow-blueprints";

const applicationSchema = z.object({
  name: z.string().min(3),
  department: z.string().min(2),
  objective: z.string().min(20),
  priority: z.string().optional(),
  mode: z.string().optional()
});

export async function POST(request: Request) {
  const { supabase, profile } = await requireUser(["admin", "designer"]);
  const body = await request.json().catch(() => null);
  const parsed = applicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ workflow_error: "Please complete the required application fields." }, { status: 422 });
  }

  const blueprint = buildWorkflowBlueprint(parsed.data);

  const { data, error } = await supabase
    .from("workflow_applications")
    .insert({
      workflow_name: parsed.data.name,
      workflow_department: parsed.data.department,
      workflow_objective: parsed.data.objective,
      workflow_description: parsed.data.objective,
      workflow_status: "draft",
      workflow_json_definition: blueprint.appJson,
      workflow_created_by: profile.workflow_id
    })
    .select("workflow_id, workflow_name, workflow_status, workflow_created_at")
    .single();

  if (error) {
    return NextResponse.json({ workflow_error: error.message }, { status: 400 });
  }

  const sharedPayload = {
    workflow_application_id: data.workflow_id
  };

  await Promise.all([
    supabase.from("workflow_workflows").insert({
      ...sharedPayload,
      workflow_json_definition: { steps: blueprint.steps }
    }),
    supabase.from("workflow_personas").insert({
      ...sharedPayload,
      workflow_json_definition: { personas: blueprint.personas }
    }),
    supabase.from("workflow_data_models").insert({
      ...sharedPayload,
      workflow_json_definition: { models: blueprint.dataModels }
    }),
    supabase.from("workflow_integrations").insert({
      ...sharedPayload,
      workflow_json_definition: { integrations: blueprint.integrations }
    }),
    supabase.from("workflow_mvp_plans").insert({
      ...sharedPayload,
      workflow_json_definition: { plan: blueprint.mvpPlan }
    }),
    supabase.from("workflow_app_previews").insert({
      ...sharedPayload,
      workflow_preview_json: blueprint.preview,
      workflow_runtime_state: blueprint.preview.runtimeState
    }),
    supabase.from("workflow_activities").insert({
      workflow_application_id: data.workflow_id,
      workflow_user_id: profile.workflow_id,
      workflow_action: "Application blueprint created",
      workflow_description: `${profile.workflow_full_name} created ${data.workflow_name}`,
      workflow_metadata: blueprint
    })
  ]);

  return NextResponse.json({ workflow_application: data, workflow_blueprint: blueprint });
}
