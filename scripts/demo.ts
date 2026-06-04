import fs from "fs";
import path from "path";
import { buildMetrics, detectDuplicates, outputDir, relatedTasks, semanticSearch, smartTags, writeAllOutputs } from "./lib/flowintel";

const built = writeAllOutputs();
const { dataset, metrics, latency } = built;
const sampleTask = dataset.tasks[0];
const search = semanticSearch(dataset.tasks, "find repeated Cognito login work across shared boards", 5);
const duplicates = detectDuplicates(dataset.tasks, "Resolve Cognito sign-in failure", "Users cannot access shared workspace after invite");
const related = relatedTasks(dataset.tasks, sampleTask.taskId);
const tags = smartTags("Add semantic duplicate detection route", "AI assistance should find related workflow tasks and log latency metrics");

const summary = `# FlowIntel Demo Summary

## Workspace And Board Overview
- Workspaces: ${dataset.workspaces.length}
- Boards: ${dataset.boards.length}
- Lists: ${dataset.lists.length}
- Tasks: ${dataset.tasks.length}
- Total records: ${dataset.records.length}

## Task Movement
The collaboration simulation exercised ${built.simulation.task_moves_tested} task moves and ${built.simulation.status_changes_tested} status changes across ${built.simulation.simulated_client_sessions} concurrent client sessions.

## Semantic Task Search
Query: find repeated Cognito login work across shared boards

Top result: ${search[0].task_id} - ${search[0].title} (${search[0].similarity_score})

## Duplicate Detection
Top duplicate: ${duplicates[0].task_id} - ${duplicates[0].title} (${duplicates[0].similarity_score})

## Related Task Discovery
Source task: ${sampleTask.taskId} - ${sampleTask.title}

Top related task: ${related[0].task_id} - ${related[0].title} (${related[0].similarity_score})

## Smart Tagging
${tags.map((tag) => `- ${tag.tag}: ${tag.confidence} - ${tag.reason}`).join("\n")}

## Review Metadata Visibility
Review records generated: ${dataset.reviews.length}

## Metrics Summary
\`\`\`json
${JSON.stringify(metrics, null, 2)}
\`\`\`

## Example Logs
\`\`\`json
${JSON.stringify(built.simulation.logs.slice(0, 3), null, 2)}
\`\`\`

## Latency Report
\`\`\`json
${JSON.stringify(latency, null, 2)}
\`\`\`
`;

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, "demo_summary.md"), summary);

console.log(summary);
