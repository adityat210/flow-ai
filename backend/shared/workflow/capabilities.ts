export const coreEntities = [
  "Workspace",
  "Board",
  "List",
  "Task",
  "Comment",
  "User",
  "ReviewMetadata",
  "ActivityLog",
  "SmartTag",
];

export const apiRoutes = [
  "POST /workspaces",
  "GET /workspaces/{workspaceId}",
  "POST /workspaces/{workspaceId}/boards",
  "GET /workspaces/{workspaceId}/boards",
  "GET /boards/{boardId}",
  "GET /boards/{boardId}/lists",
  "POST /boards/{boardId}/tasks",
  "PUT /boards/{boardId}/tasks/{taskId}",
  "GET /search",
  "POST /tasks/analyze",
  "POST /tasks/duplicates",
  "GET /tasks/{taskId}/related",
  "POST /tasks/smart-tags",
  "GET /tasks/{taskId}/review-metadata",
  "GET /metrics",
];

export const accessPatterns = [
  "WORKSPACE#<workspaceId> / METADATA",
  "WORKSPACE#<workspaceId> / BOARD#<boardId>",
  "BOARD#<boardId> / LIST#<listId>",
  "BOARD#<boardId> / TASK#<taskId>",
  "TASK#<taskId> / COMMENT#<commentId>",
  "TASK#<taskId> / REVIEW#<reviewId>",
  "TAG#<tagName> / TASK#<taskId>",
  "BOARD#<boardId> / ACTIVITY#<timestamp>#<activityId>",
];

export function smartTagText(title: string, description = "") {
  const text = `${title} ${description}`.toLowerCase();
  const rules: Record<string, string[]> = {
    backend: ["api", "lambda", "dynamodb", "route"],
    frontend: ["ui", "react", "next", "board"],
    auth: ["auth", "cognito", "login", "session"],
    data: ["data", "pk", "sk", "model"],
    bug: ["bug", "fix", "failure"],
    review: ["review", "metadata", "approval"],
    "ai-assistance": ["semantic", "duplicate", "related", "tag"],
    observability: ["log", "latency", "metric", "cloudwatch"],
    testing: ["test", "verify", "ci"],
    workflow: ["task", "workspace", "goal", "assignment"],
  };

  return Object.entries(rules)
    .map(([tag, words]) => {
      const hits = words.filter((word) => text.includes(word));
      return {
        tag,
        confidence: Math.min(0.98, 0.45 + hits.length * 0.18),
        reason: hits.length ? `Matched ${hits.join(", ")}.` : "Low-confidence fallback.",
      };
    })
    .filter((tag) => tag.confidence >= 0.63)
    .sort((a, b) => b.confidence - a.confidence);
}
