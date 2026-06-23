import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    workflow_status: "ok",
    workflow_version: process.env.APP_VERSION ?? "0.1.0",
    workflow_environment: process.env.APP_ENV ?? "development",
    workflow_database_status: process.env.NEXT_PUBLIC_SUPABASE_URL ? "configured" : "not_configured",
    workflow_queue_status: "ready",
    workflow_storage_status: "ready",
    workflow_checked_at: new Date().toISOString()
  });
}
