# API Documentation

## `GET /api/health`

Returns application health, version, environment, database configuration status, queue status, storage status, and check timestamp.

## `POST /api/builder`

Creates a validated workflow builder request.

Request:

```json
{
  "name": "Loan Approval Preview",
  "department": "Retail Banking",
  "objective": "Generate an executable application preview with role-based views.",
  "mode": "designer"
}
```

Response:

```json
{
  "workflow_id": "uuid",
  "workflow_status": "draft",
  "workflow_blueprint": {
    "workflow_name": "Loan Approval Preview"
  },
  "workflow_next_action": "Persist to workflow_applications and dispatch AI orchestration job."
}
```
