import fs from "fs";
import path from "path";
import { outputDir, writeAllOutputs } from "./lib/flowintel";

const metricsPath = path.join(outputDir, "project_metrics.json");
if (!fs.existsSync(metricsPath)) {
  writeAllOutputs();
}

const metrics = JSON.parse(fs.readFileSync(metricsPath, "utf8"));
const checks: [string, boolean][] = [
  ["5+ core entities implemented", metrics.core_entities >= 5],
  ["10+ REST API routes implemented", metrics.api_routes >= 10],
  ["200+ seeded records generated", metrics.seeded_records >= 200],
  ["3+ shared workspaces seeded/tested", metrics.shared_workspaces >= 3],
  ["5+ boards seeded/tested", metrics.boards >= 5],
  ["DynamoDB PK/SK access patterns implemented", metrics.dynamodb_access_patterns >= 5],
  ["AI-assisted tagging implemented", metrics.workflow_features.includes("smart_tagging")],
  ["Duplicate-task detection implemented", metrics.workflow_features.includes("duplicate_detection")],
  ["Related-task discovery implemented", metrics.workflow_features.includes("related_task_discovery")],
  ["Semantic retrieval beats keyword baseline by approximately 5x", metrics.semantic_coverage_multiplier >= 4.5],
  ["3+ concurrent client sessions simulated", metrics.simulated_client_sessions >= 3],
  ["Request logging implemented", metrics.request_logs > 0],
  ["Latency tracking implemented", metrics.average_latency_ms > 0],
  ["Centralized CloudWatch-style logs generated", metrics.request_logs >= 50],
  ["20+ unit/integration/API tests included", metrics.unit_integration_api_tests >= 20],
  ["Common AI workflows run in sub- to low-single-digit-second response times", metrics.ai_workflow_average_latency_ms < 3000],
];

console.log("FLOWINTEL PROJECT CAPABILITY VERIFICATION");
console.log("");
let failed = false;
for (const [label, passed] of checks) {
  console.log(`[${passed ? "PASS" : "FAIL"}] ${label}`);
  failed ||= !passed;
}

if (failed) {
  process.exit(1);
}
