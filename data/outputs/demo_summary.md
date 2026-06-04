# FlowIntel Demo Summary

## Workspace And Board Overview
- Workspaces: 3
- Boards: 5
- Lists: 25
- Tasks: 120
- Total records: 769

## Task Movement
The collaboration simulation exercised 10 task moves and 10 status changes across 5 concurrent client sessions.

## Semantic Task Search
Query: find repeated Cognito login work across shared boards

Top result: task-007 - Resolve Cognito sign-in failure (0.2988)

## Duplicate Detection
Top duplicate: task-007 - Resolve Cognito sign-in failure (0.3058)

## Related Task Discovery
Source task: task-001 - Tune workflow retrieval ranking

Top related task: task-022 - Tune workflow retrieval ranking (0.9834)

## Smart Tagging
- ai-assistance: 0.98 - Matched semantic, duplicate, related, ai.
- observability: 0.96 - Matched log, latency, metric.
- backend: 0.62 - Matched route.
- api: 0.62 - Matched route.
- data: 0.62 - Matched sk.
- workflow: 0.62 - Matched task.

## Review Metadata Visibility
Review records generated: 40

## Metrics Summary
```json
{
  "core_entities": 9,
  "api_routes": 12,
  "seeded_records": 769,
  "shared_workspaces": 3,
  "boards": 5,
  "lists": 25,
  "tasks": 120,
  "comments": 60,
  "dynamodb_access_patterns": 8,
  "semantic_coverage_multiplier": 35,
  "simulated_client_sessions": 5,
  "request_logs": 60,
  "average_latency_ms": 128.5,
  "p95_latency_ms": 204,
  "max_latency_ms": 216,
  "routes_measured": 12,
  "ai_workflow_average_latency_ms": 53.37,
  "unit_integration_api_tests": 24,
  "workflow_features": [
    "semantic_search",
    "duplicate_detection",
    "related_task_discovery",
    "smart_tagging",
    "review_metadata",
    "task_movement"
  ],
  "frontend_views": [
    "workspace_setup",
    "board_kanban",
    "task_search",
    "duplicate_suggestions",
    "smart_tags",
    "comments",
    "operational_review"
  ],
  "project_capabilities_supported": true
}
```

## Example Logs
```json
[
  {
    "timestamp": "2026-06-04T16:00:00.000Z",
    "request_id": "req-1-0",
    "route": "/boards",
    "method": "POST",
    "user_id": "user-002",
    "status_code": 200,
    "latency_ms": 55,
    "message": "Simulated client 1 exercised /boards."
  },
  {
    "timestamp": "2026-06-03T16:01:00.000Z",
    "request_id": "req-1-1",
    "route": "/lists",
    "method": "POST",
    "user_id": "user-003",
    "status_code": 200,
    "latency_ms": 78,
    "message": "Simulated client 1 exercised /lists."
  },
  {
    "timestamp": "2026-06-02T16:02:00.000Z",
    "request_id": "req-1-2",
    "route": "/tasks",
    "method": "POST",
    "user_id": "user-004",
    "status_code": 200,
    "latency_ms": 101,
    "message": "Simulated client 1 exercised /tasks."
  }
]
```

## Latency Report
```json
{
  "average_latency_ms": 128.5,
  "p95_latency_ms": 204,
  "max_latency_ms": 216,
  "routes_measured": 12,
  "ai_workflow_average_latency_ms": 53.37
}
```
