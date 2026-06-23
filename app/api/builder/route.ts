import { NextResponse } from "next/server";
import { builderRequestSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = builderRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        workflow_error: "validation_failed",
        workflow_correlation_id: crypto.randomUUID(),
        workflow_issues: parsed.error.flatten().fieldErrors
      },
      { status: 422 }
    );
  }

  return NextResponse.json({
    workflow_id: crypto.randomUUID(),
    workflow_status: "draft",
    workflow_blueprint: {
      workflow_name: parsed.data.name,
      workflow_department: parsed.data.department,
      workflow_objective: parsed.data.objective,
      workflow_preview_mode: parsed.data.mode
    },
    workflow_next_action: "Persist to workflow_applications and dispatch AI orchestration job."
  });
}
