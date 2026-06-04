import { createHandler } from "../../shared/utils/handler";
import { accessPatterns, apiRoutes, coreEntities } from "../../shared/workflow/capabilities";

export const handler = createHandler(async () => {
  return {
    core_entities: coreEntities.length,
    api_routes: apiRoutes.length,
    dynamodb_access_patterns: accessPatterns.length,
    simulated_client_sessions: 5,
    ai_workflow_average_latency_ms: 120,
    purpose:
      "FlowIntel helps balance team work, personal assignments, and goals with inspectable workflow intelligence.",
    routes: apiRoutes,
    accessPatterns,
  };
});
