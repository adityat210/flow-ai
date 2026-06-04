import { createHandler } from "../../shared/utils/handler";
import { smartTagText } from "../../shared/workflow/capabilities";

export const handler = createHandler(async (event) => {
  const action = event.pathParameters?.action || "smart-tags";
  const body = JSON.parse(event.body || "{}");
  const title = body.title || "";
  const description = body.description || "";

  if (!title) {
    return { error: "Missing title" };
  }

  const tags = smartTagText(title, description);
  const response = {
    action,
    query: `${title} ${description}`.trim(),
    smart_tags: tags,
    duplicate_candidates: [
      {
        task_id: "task-001",
        title: "Resolve Cognito sign-in failure",
        similarity_score: 0.86,
        reason: "Same auth and shared-workspace language.",
      },
    ],
    related_tasks: [
      {
        task_id: "task-017",
        title: "Harden workspace auth checks",
        similarity_score: 0.79,
        reason: "Related team-access and assignment-planning workflow.",
      },
    ],
  };

  return response;
});
