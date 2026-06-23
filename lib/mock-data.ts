import type { ApplicationBlueprint, AuditEvent } from "@/lib/types";

export const bernudaBlueprint: ApplicationBlueprint = {
  id: "workflow_app_bernuda_001",
  name: "Loan Approval Preview",
  department: "Retail Banking",
  objective: "Generate an executable preview for a customer loan approval process.",
  status: "in_review",
  updatedAt: "2026-06-23T09:30:00+02:00",
  personas: [
    {
      id: "admin",
      name: "Platform Admin",
      description: "Configures RBAC, settings, generated schemas, and audit policy.",
      permissions: ["workflow.read", "workflow.write", "preview.run", "audit.read", "settings.manage", "user.manage"],
      visiblePages: ["dashboard", "application", "approval", "analytics", "settings"]
    },
    {
      id: "manager",
      name: "Business Manager",
      description: "Reviews workflow fit, validates KPIs, and approves MVP scope.",
      permissions: ["workflow.read", "preview.run", "audit.read"],
      visiblePages: ["dashboard", "approval", "analytics"]
    },
    {
      id: "customer",
      name: "Customer",
      description: "Experiences the generated customer-facing preview.",
      permissions: ["preview.run"],
      visiblePages: ["application"]
    }
  ],
  workflowSteps: [
    {
      id: "capture",
      title: "Capture Request",
      ownerRole: "Customer",
      type: "input",
      description: "Customer submits purpose, amount, employment, and identity details.",
      next: ["kyc"]
    },
    {
      id: "kyc",
      title: "KYC Verification",
      ownerRole: "System",
      type: "automation",
      description: "Mocked identity provider validates customer data and returns risk flags.",
      next: ["score"]
    },
    {
      id: "score",
      title: "Credit Decision",
      ownerRole: "Risk Engine",
      type: "decision",
      description: "Rules decide whether the application is auto-approved, escalated, or declined.",
      next: ["approval", "notify"]
    },
    {
      id: "approval",
      title: "Manager Approval",
      ownerRole: "Business Manager",
      type: "approval",
      description: "Manager reviews exceptions and approves the simulated workflow state.",
      next: ["notify"]
    },
    {
      id: "notify",
      title: "Notify Stakeholders",
      ownerRole: "System",
      type: "notification",
      description: "Customer and internal teams receive in-app and email notifications.",
      next: []
    }
  ],
  dataEntities: [
    {
      name: "workflow_applications",
      purpose: "Stores generated business application blueprints.",
      fields: [
        { name: "workflow_name", type: "text", required: true },
        { name: "workflow_department", type: "text", required: true },
        { name: "workflow_json_definition", type: "json", required: true }
      ]
    },
    {
      name: "workflow_app_previews",
      purpose: "Stores executable preview definitions and runtime state.",
      fields: [
        { name: "workflow_application_id", type: "uuid", required: true },
        { name: "workflow_preview_json", type: "json", required: true },
        { name: "workflow_version", type: "number", required: true }
      ]
    },
    {
      name: "workflow_audit_logs",
      purpose: "Compliance trail for authentication, data, RBAC, and workflow events.",
      fields: [
        { name: "workflow_user_id", type: "uuid", required: false },
        { name: "workflow_action", type: "text", required: true },
        { name: "workflow_previous_values", type: "json", required: false },
        { name: "workflow_new_values", type: "json", required: false }
      ]
    }
  ],
  integrations: [
    {
      name: "KYC Provider",
      type: "api",
      direction: "outbound",
      auth: "oauth2",
      simulatedResponse: "Verified with medium-risk residential mismatch."
    },
    {
      name: "Core Banking",
      type: "database",
      direction: "bidirectional",
      auth: "jwt",
      simulatedResponse: "Customer account and repayment capacity returned."
    },
    {
      name: "Decision Webhook",
      type: "webhook",
      direction: "outbound",
      auth: "api_key",
      simulatedResponse: "Decision event queued for downstream processing."
    }
  ],
  preview: {
    appName: "Retail Loan System Preview",
    version: 3,
    runtimeState: {
      currentStep: "score",
      riskScore: 72,
      persona: "manager",
      offlineCache: true
    },
    pages: [
      {
        id: "dashboard",
        name: "Operations Dashboard",
        type: "dashboard",
        allowedPersonas: ["admin", "manager"],
        components: [
          { id: "m1", kind: "metric", label: "Generated screens", value: "12", tone: "primary" },
          { id: "m2", kind: "metric", label: "Validation rules", value: "38", tone: "success" },
          { id: "m3", kind: "metric", label: "Open exceptions", value: "4", tone: "warning" },
          { id: "t1", kind: "timeline", label: "Workflow Progress", events: ["Request captured", "KYC completed", "Credit decision running"] }
        ]
      },
      {
        id: "application",
        name: "Loan Application",
        type: "form",
        allowedPersonas: ["admin", "customer"],
        components: [
          { id: "i1", kind: "input", label: "Requested amount", required: true, value: "75,000" },
          { id: "i2", kind: "select", label: "Purpose", options: ["Business expansion", "Education", "Home improvement"], value: "Business expansion" },
          { id: "a1", kind: "action", label: "Submit simulated application", targetPage: "dashboard" }
        ]
      },
      {
        id: "approval",
        name: "Manager Approval",
        type: "approval",
        allowedPersonas: ["admin", "manager"],
        components: [
          { id: "r1", kind: "metric", label: "Risk score", value: "72", tone: "warning" },
          { id: "tbl1", kind: "table", label: "Decision Factors", columns: ["Factor", "Result", "Weight"], rows: [["Income", "Pass", "High"], ["KYC", "Review", "Medium"], ["Debt ratio", "Pass", "High"]] },
          { id: "a2", kind: "action", label: "Approve simulation", targetPage: "analytics" }
        ]
      },
      {
        id: "analytics",
        name: "Executive Analytics",
        type: "analytics",
        allowedPersonas: ["admin", "manager"],
        components: [
          { id: "m4", kind: "metric", label: "MVP confidence", value: "86%", tone: "success" },
          { id: "m5", kind: "metric", label: "Integration risk", value: "Medium", tone: "warning" }
        ]
      },
      {
        id: "settings",
        name: "Security Settings",
        type: "settings",
        allowedPersonas: ["admin"],
        components: [
          { id: "s1", kind: "select", label: "MFA policy", options: ["Required", "Optional", "Disabled"], value: "Required" },
          { id: "s2", kind: "select", label: "Session timeout", options: ["15 minutes", "30 minutes", "60 minutes"], value: "30 minutes" }
        ]
      }
    ]
  }
};

export const auditEvents: AuditEvent[] = [
  {
    id: "workflow_audit_101",
    action: "Preview executed",
    actor: "N. Architect",
    at: "2026-06-23 09:25",
    ipAddress: "10.12.4.20",
    browser: "Chrome",
    entity: "workflow_app_previews",
    outcome: "success"
  },
  {
    id: "workflow_audit_102",
    action: "Permission group changed",
    actor: "Platform Admin",
    at: "2026-06-23 09:11",
    ipAddress: "10.12.4.18",
    browser: "Edge",
    entity: "workflow_roles",
    outcome: "warning"
  },
  {
    id: "workflow_audit_103",
    action: "Failed MFA challenge",
    actor: "Unknown",
    at: "2026-06-23 08:58",
    ipAddress: "196.45.22.10",
    browser: "Firefox",
    entity: "workflow_auth_events",
    outcome: "failed"
  }
];
