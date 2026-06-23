export type WorkflowRole = "admin" | "designer" | "viewer";

export function portalPathForRole(role: WorkflowRole) {
  if (role === "admin") return "/portal/admin";
  if (role === "designer") return "/portal/designer";
  return "/portal/viewer";
}
