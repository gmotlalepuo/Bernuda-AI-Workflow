export type WorkflowBlueprintInput = {
  name: string;
  department: string;
  objective: string;
  priority?: string;
  mode?: string;
};

export function buildWorkflowBlueprint(input: WorkflowBlueprintInput) {
  const lowerObjective = input.objective.toLowerCase();
  const needsApproval = /approve|approval|review|sign off|sign-off|authorize/.test(lowerObjective);
  const needsUpload = /file|document|upload|attachment/.test(lowerObjective);
  const needsDecision = /decide|decision|eligibility|risk|score|approve/.test(lowerObjective);

  const steps = [
    { id: "capture", title: "Capture request", ownerRole: "Requester", type: "input", description: `Collect the core request for ${input.name}.`, next: ["validate"] },
    { id: "validate", title: "Validate inputs", ownerRole: "System", type: "automation", description: "Check required fields, formats, and policy rules.", next: needsDecision ? ["decision"] : ["notify"] },
    ...(needsDecision ? [{
      id: "decision",
      title: "Decision review",
      ownerRole: "Reviewer",
      type: "decision",
      description: "Run the generated decision logic and route to approval if needed.",
      next: needsApproval ? ["approval", "notify"] : ["notify"]
    }] : []),
    ...(needsApproval ? [{
      id: "approval",
      title: "Approval",
      ownerRole: "Manager",
      type: "approval",
      description: "Authorize the workflow outcome and record the final status.",
      next: ["notify"]
    }] : []),
    { id: "notify", title: "Notify stakeholders", ownerRole: "System", type: "notification", description: "Send in-app and email updates to the right people.", next: [] }
  ];

  const personas = [
    {
      id: "admin",
      name: "Platform Admin",
      description: "Manages users, policy, schema, and approvals.",
      permissions: ["workflow.read", "workflow.write", "preview.run", "audit.read", "settings.manage", "user.manage"],
      visiblePages: ["dashboard", "application", "approval", "analytics", "settings"]
    },
    {
      id: "designer",
      name: "Workflow Designer",
      description: "Creates and refines workflow blueprints and preview definitions.",
      permissions: ["workflow.read", "workflow.write", "preview.run", "audit.read"],
      visiblePages: ["dashboard", "application", "approval", "analytics"]
    },
    {
      id: "viewer",
      name: "Business Viewer",
      description: "Reviews the generated system in read-only mode.",
      permissions: ["workflow.read", "preview.run"],
      visiblePages: ["dashboard", "application", "approval", "analytics"]
    }
  ];

  const dataModels = [
    {
      name: "workflow_applications",
      purpose: `Stores blueprints for ${input.name}.`,
      fields: [
        { name: "workflow_name", type: "text", required: true },
        { name: "workflow_department", type: "text", required: true },
        { name: "workflow_objective", type: "text", required: true },
        { name: "workflow_status", type: "text", required: true }
      ]
    },
    {
      name: "workflow_activities",
      purpose: "Tracks workflow execution, transitions, and user actions.",
      fields: [
        { name: "workflow_action", type: "text", required: true },
        { name: "workflow_description", type: "text", required: true },
        { name: "workflow_metadata", type: "json", required: false }
      ]
    },
    ...(needsUpload ? [{
      name: "workflow_documents",
      purpose: "Stores uploaded supporting documents and validation results.",
      fields: [
        { name: "workflow_storage_path", type: "text", required: true },
        { name: "workflow_scan_status", type: "text", required: true },
        { name: "workflow_version", type: "number", required: true }
      ]
    }] : [])
  ];

  const integrations = [
    {
      name: "Supabase Auth",
      type: "database" as const,
      direction: "bidirectional" as const,
      auth: "jwt" as const,
      simulatedResponse: "Session and role data available for the portal."
    },
    {
      name: "Notification service",
      type: "email" as const,
      direction: "outbound" as const,
      auth: "api_key" as const,
      simulatedResponse: "Approval and status notifications queued."
    },
    ...(needsDecision ? [{
      name: "Decision engine",
      type: "api" as const,
      direction: "outbound" as const,
      auth: "oauth2" as const,
      simulatedResponse: "Decision scoring request simulated."
    }] : [])
  ];

  const mvpPlan = [
    { phase: "Phase 1", title: "Capture", detail: "Collect workflow requirements and create the blueprint." },
    { phase: "Phase 2", title: "Review", detail: "Move the blueprint into review and capture approval history." },
    { phase: "Phase 3", title: "Execute", detail: "Promote the workflow to approved and present it in the viewer portal." }
  ];

  const preview = {
    appName: `${input.name} Preview`,
    version: 1,
    runtimeState: {
      objective: input.objective,
      department: input.department,
      mode: input.mode ?? "designer",
      priority: input.priority ?? "mvp"
    },
    pages: [
      {
        id: "dashboard",
        name: "Dashboard",
        type: "dashboard" as const,
        allowedPersonas: ["admin", "designer", "viewer"],
        components: [
          { id: "m1", kind: "metric" as const, label: "Workflow steps", value: String(steps.length), tone: "primary" as const },
          { id: "m2", kind: "metric" as const, label: "Integrations", value: String(integrations.length), tone: "success" as const },
          { id: "t1", kind: "timeline" as const, label: "Current stage", events: steps.map((step) => step.title) }
        ]
      },
      {
        id: "application",
        name: "Application",
        type: "form" as const,
        allowedPersonas: ["admin", "designer", "viewer"],
        components: [
          { id: "i1", kind: "input" as const, label: "Application name", required: true, value: input.name },
          { id: "i2", kind: "select" as const, label: "Department", options: [input.department], value: input.department }
        ]
      },
      {
        id: "approval",
        name: "Approval",
        type: "approval" as const,
        allowedPersonas: ["admin", "designer", "viewer"],
        components: [
          { id: "tbl1", kind: "table" as const, label: "Workflow steps", columns: ["Step", "Owner", "Type"], rows: steps.map((step) => [step.title, step.ownerRole, step.type]) }
        ]
      },
      {
        id: "analytics",
        name: "Analytics",
        type: "analytics" as const,
        allowedPersonas: ["admin", "designer", "viewer"],
        components: [
          { id: "m3", kind: "metric" as const, label: "MVP phases", value: String(mvpPlan.length), tone: "warning" as const }
        ]
      }
    ]
  };

  return {
    steps,
    personas,
    dataModels,
    integrations,
    mvpPlan,
    preview,
    appJson: {
      workflow_name: input.name,
      workflow_department: input.department,
      workflow_objective: input.objective,
      workflow_priority: input.priority ?? "mvp",
      workflow_preview_mode: input.mode ?? "designer"
    }
  };
}
