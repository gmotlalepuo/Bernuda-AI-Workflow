export type WorkflowStatus = "draft" | "ready" | "in_review" | "approved" | "archived";

export type Permission =
  | "workflow.read"
  | "workflow.write"
  | "preview.run"
  | "audit.read"
  | "settings.manage"
  | "user.manage";

export type Persona = {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  visiblePages: string[];
};

export type WorkflowStep = {
  id: string;
  title: string;
  ownerRole: string;
  type: "input" | "decision" | "approval" | "automation" | "notification";
  description: string;
  next: string[];
};

export type DataEntity = {
  name: string;
  purpose: string;
  fields: Array<{
    name: string;
    type: "text" | "number" | "date" | "boolean" | "json" | "uuid";
    required: boolean;
  }>;
};

export type IntegrationBlueprint = {
  name: string;
  type: "api" | "webhook" | "email" | "file" | "database";
  direction: "inbound" | "outbound" | "bidirectional";
  auth: "none" | "api_key" | "oauth2" | "jwt";
  simulatedResponse: string;
};

export type PreviewComponent =
  | { id: string; kind: "metric"; label: string; value: string; tone: "primary" | "success" | "warning" | "danger" }
  | { id: string; kind: "input"; label: string; required: boolean; value?: string }
  | { id: string; kind: "select"; label: string; options: string[]; value?: string }
  | { id: string; kind: "table"; label: string; columns: string[]; rows: string[][] }
  | { id: string; kind: "timeline"; label: string; events: string[] }
  | { id: string; kind: "action"; label: string; targetPage: string };

export type PreviewPage = {
  id: string;
  name: string;
  type: "auth" | "dashboard" | "form" | "approval" | "analytics" | "settings";
  allowedPersonas: string[];
  components: PreviewComponent[];
};

export type AppPreviewDefinition = {
  appName: string;
  version: number;
  pages: PreviewPage[];
  runtimeState: Record<string, string | number | boolean>;
};

export type ApplicationBlueprint = {
  id: string;
  name: string;
  department: string;
  objective: string;
  status: WorkflowStatus;
  updatedAt: string;
  personas: Persona[];
  workflowSteps: WorkflowStep[];
  dataEntities: DataEntity[];
  integrations: IntegrationBlueprint[];
  preview: AppPreviewDefinition;
};

export type AuditEvent = {
  id: string;
  action: string;
  actor: string;
  at: string;
  ipAddress: string;
  browser: string;
  entity: string;
  outcome: "success" | "warning" | "failed";
};
