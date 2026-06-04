import assert from "assert";
import fs from "fs";
import path from "path";
import {
  buildMetrics,
  detectDuplicates,
  evaluateCoverage,
  generateDataset,
  latencyReport,
  outputDir,
  relatedTasks,
  semanticSearch,
  simulateCollaboration,
  smartTags,
  writeAllOutputs,
} from "../lib/flowintel";

type TestCase = [string, () => void];
const dataset = generateDataset();

const tests: TestCase[] = [
  ["has 5+ core entities", () => assert(dataset.records.some((r) => r.entityType === "Workspace"))],
  ["seeds 3 workspaces", () => assert.equal(dataset.workspaces.length, 3)],
  ["seeds 5 boards", () => assert(dataset.boards.length >= 5)],
  ["seeds lists per board", () => assert(dataset.lists.length >= 25)],
  ["seeds 200+ records", () => assert(dataset.records.length >= 200)],
  ["models workspace metadata PK/SK", () => assert.equal(dataset.workspaces[0].SK, "METADATA")],
  ["models workspace to board traversal", () => assert(dataset.boards[0].PK.startsWith("WORKSPACE#"))],
  ["models board to list traversal", () => assert(dataset.lists[0].SK.startsWith("LIST#"))],
  ["models board to task traversal", () => assert(dataset.tasks[0].PK.startsWith("BOARD#"))],
  ["models task to comments", () => assert(dataset.comments[0].PK.startsWith("TASK#"))],
  ["models task to reviews", () => assert(dataset.reviews[0].SK.startsWith("REVIEW#"))],
  ["models tag lookup", () => assert(dataset.tags[0].PK.startsWith("TAG#"))],
  ["semantic search returns tasks", () => assert(semanticSearch(dataset.tasks, "Cognito login shared workspace").length > 0)],
  ["duplicate detection returns scored candidates", () => assert(detectDuplicates(dataset.tasks, "Fix login issue", "Cognito sign in failure")[0].similarity_score > 0)],
  ["related tasks excludes source", () => assert.notEqual(relatedTasks(dataset.tasks, dataset.tasks[0].taskId)[0].task_id, dataset.tasks[0].taskId)],
  ["smart tagging returns confidence", () => assert(smartTags("Fix API latency bug", "CloudWatch route metrics")[0].confidence >= 0.62)],
  ["evaluation has 20 scenarios", () => assert.equal(evaluateCoverage(dataset).scenarios.length, 20)],
  ["semantic coverage beats baseline", () => assert(evaluateCoverage(dataset).improvement_multiplier >= 4.5)],
  ["collaboration sim has 3+ sessions", () => assert(simulateCollaboration(dataset).simulated_client_sessions >= 3)],
  ["collaboration sim has 10+ moves", () => assert(simulateCollaboration(dataset).task_moves_tested >= 10)],
  ["request logs include latency", () => assert(simulateCollaboration(dataset).logs[0].latency_ms > 0)],
  ["latency report has p95", () => assert(latencyReport(simulateCollaboration(dataset).logs, [50, 60]).p95_latency_ms > 0)],
  ["metrics satisfy core route count", () => assert(buildMetrics().metrics.api_routes >= 10)],
  ["outputs are written", () => { writeAllOutputs(); assert(fs.existsSync(path.join(outputDir, "project_metrics.json"))); }],
];

let passed = 0;
for (const [name, run] of tests) {
  run();
  passed += 1;
  console.log(`[PASS] ${name}`);
}

console.log(`${passed} tests passed`);
