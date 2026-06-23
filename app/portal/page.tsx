import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { portalPathForRole } from "@/lib/roles";

export default async function PortalIndex() {
  const { profile } = await requireUser();
  redirect(portalPathForRole(profile.workflow_role));
}
