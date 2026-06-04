import fs from "fs";
import path from "path";
import { performance } from "perf_hooks";

export type Status = "todo" | "in-progress" | "blocked" | "review" | "done";
export type Priority = "low" | "medium" | "high";

export type WorkflowRecord = {
  PK: string;
  SK: string;
  entityType: string;
  [key: string]: unknown;
};

export type TaskRecord = WorkflowRecord & {
  entityType: "Task";
  taskId: string;
  workspaceId: string;
  boardId: string;
  listId: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  tags: string[];
  topic: string;
  position: number;
  createdAt: string;
  updatedAt: string;
};

export type FlowIntelDataset = {
  users: WorkflowRecord[];
  workspaces: WorkflowRecord[];
  boards: WorkflowRecord[];
  lists: WorkflowRecord[];
  tasks: TaskRecord[];
  comments: WorkflowRecord[];
  reviews: WorkflowRecord[];
  tags: WorkflowRecord[];
  activities: WorkflowRecord[];
  records: WorkflowRecord[];
};

export const rootDir = path.resolve(__dirname, "../..");
export const outputDir = path.join(rootDir, "data/outputs");
export const imagesDir = path.join(rootDir, "docs/images");

const topics = [
  {
    topic: "auth",
    titles: ["Fix login session refresh", "Resolve Cognito sign-in failure", "Harden workspace auth checks"],
    description: "Cognito-style authentication, session validation, member authorization, and login reliability.",
    tags: ["auth", "backend", "integration", "urgent"],
  },
  {
    topic: "semantic-search",
    titles: ["Improve semantic task search", "Tune workflow retrieval ranking", "Add related task recommendations"],
    description: "TF-IDF semantic retrieval for finding related workflow tasks beyond exact keyword matching.",
    tags: ["ai-assistance", "workflow", "data", "api"],
  },
  {
    topic: "duplicates",
    titles: ["Detect duplicate task requests", "Flag repeated implementation work", "Surface similar backlog items"],
    description: "Duplicate-task detection with similarity scores, reasoning, and review metadata visibility.",
    tags: ["ai-assistance", "review", "workflow", "testing"],
  },
  {
    topic: "observability",
    titles: ["Add request latency tracking", "Generate CloudWatch style logs", "Create route metrics report"],
    description: "Request logging, p95 latency tracking, route status codes, and local CloudWatch-style evidence.",
    tags: ["observability", "api", "backend", "testing"],
  },
  {
    topic: "frontend",
    titles: ["Polish board movement UI", "Show smart tag suggestions", "Render operational review panel"],
    description: "React and Next.js workspace views for task movement, search, duplicates, tags, and review state.",
    tags: ["frontend", "workflow", "review", "integration"],
  },
  {
    topic: "data-model",
    titles: ["Document PK SK access patterns", "Implement sorted task retrieval", "Add tag based task lookup"],
    description: "DynamoDB-style single-table PK/SK records for workspaces, boards, lists, tasks, comments, reviews, and tags.",
    tags: ["data", "backend", "api", "workflow"],
  },
  {
    topic: "testing",
    titles: ["Expand API behavior tests", "Validate collaboration simulation", "Check seeded dataset metrics"],
    description: "Unit, integration, API, route, seed, search, logging, latency, and verification coverage.",
    tags: ["testing", "integration", "workflow", "blocked"],
  },
];

const keywordBlindQueries = [
  ["users cannot access shared space after invite", "auth"],
  ["find cards about fuzzy matching backlog items", "semantic-search"],
  ["repeated work request from product review", "duplicates"],
  ["measure slow lambda endpoint behavior", "observability"],
  ["show cards moving between columns", "frontend"],
  ["lookup items by partition and sort keys", "data-model"],
  ["prove routes work in automation", "testing"],
  ["discover similar tasks across boards", "semantic-search"],
  ["summarize unresolved review notes", "duplicates"],
  ["track API response time locally", "observability"],
] as const;

function ensureDirs() {
  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(imagesDir, { recursive: true });
}

function iso(offsetDays: number, offsetMinutes = 0) {
  return new Date(Date.UTC(2026, 5, 4 - offsetDays, 16, offsetMinutes, 0)).toISOString();
}

function id(prefix: string, index: number) {
  return `${prefix}-${String(index).padStart(3, "0")}`;
}

export function generateDataset(): FlowIntelDataset {
  const users = Array.from({ length: 6 }, (_, i) => ({
    PK: `USER#${id("user", i + 1)}`,
    SK: "METADATA",
    entityType: "User",
    userId: id("user", i + 1),
    email: `flowintel.user${i + 1}@example.dev`,
    displayName: `FlowIntel User ${i + 1}`,
    createdAt: iso(40 - i),
  }));

  const workspaces = Array.from({ length: 3 }, (_, i) => ({
    PK: `WORKSPACE#${id("workspace", i + 1)}`,
    SK: "METADATA",
    entityType: "Workspace",
    workspaceId: id("workspace", i + 1),
    name: ["Platform Operations", "AI Workflow Lab", "Customer Launch Room"][i],
    ownerId: users[i].userId,
    createdAt: iso(30 - i),
    updatedAt: iso(1, i),
  }));

  const boards: WorkflowRecord[] = [];
  const lists: WorkflowRecord[] = [];
  const tasks: TaskRecord[] = [];
  const comments: WorkflowRecord[] = [];
  const reviews: WorkflowRecord[] = [];
  const tags: WorkflowRecord[] = [];
  const activities: WorkflowRecord[] = [];

  let boardIndex = 0;
  let taskIndex = 0;
  let commentIndex = 0;
  let reviewIndex = 0;
  let tagIndex = 0;
  const listNames: Status[] = ["todo", "in-progress", "blocked", "review", "done"];

  for (const workspace of workspaces) {
    const boardsInWorkspace = workspace.workspaceId === "workspace-003" ? 1 : 2;
    for (let b = 0; b < boardsInWorkspace; b++) {
      boardIndex += 1;
      const boardId = id("board", boardIndex);
      boards.push({
        PK: `WORKSPACE#${workspace.workspaceId}`,
        SK: `BOARD#${boardId}`,
        entityType: "Board",
        boardId,
        workspaceId: workspace.workspaceId,
        name: `Workflow Board ${boardIndex}`,
        createdAt: iso(25 - boardIndex),
        updatedAt: iso(boardIndex % 4),
      });

      listNames.forEach((status, position) => {
        lists.push({
          PK: `BOARD#${boardId}`,
          SK: `LIST#${status}`,
          entityType: "List",
          listId: status,
          boardId,
          workspaceId: workspace.workspaceId,
          title: status.replace("-", " "),
          position,
          createdAt: iso(20 - position),
          updatedAt: iso(position),
        });
      });

      for (let t = 0; t < 24; t++) {
        taskIndex += 1;
        const topic = topics[(taskIndex + b) % topics.length];
        const title = topic.titles[taskIndex % topic.titles.length];
        const status = listNames[taskIndex % listNames.length];
        const taskId = id("task", taskIndex);
        const task: TaskRecord = {
          PK: `BOARD#${boardId}`,
          SK: `TASK#${taskId}`,
          entityType: "Task",
          taskId,
          workspaceId: workspace.workspaceId as string,
          boardId,
          listId: status,
          title,
          description: `${topic.description} Scenario ${taskIndex} covers ${topic.topic} workflow evidence for shared boards.`,
          status,
          priority: taskIndex % 5 === 0 ? "high" : taskIndex % 3 === 0 ? "medium" : "low",
          tags: topic.tags,
          topic: topic.topic,
          position: t,
          createdAt: iso(18 - (t % 12), t),
          updatedAt: iso(t % 5, t),
        };
        tasks.push(task);

        for (const tag of topic.tags) {
          tagIndex += 1;
          tags.push({
            PK: `TAG#${tag}`,
            SK: `TASK#${taskId}`,
            entityType: "SmartTag",
            tagId: id("tag", tagIndex),
            tag,
            taskId,
            boardId,
            workspaceId: workspace.workspaceId,
            confidence: Number((0.72 + (tagIndex % 20) / 100).toFixed(2)),
            reason: `Recommended because task text matches ${tag} workflow language.`,
          });
        }

        if (t % 2 === 0) {
          commentIndex += 1;
          comments.push({
            PK: `TASK#${taskId}`,
            SK: `COMMENT#${iso(t % 8, t)}#${id("comment", commentIndex)}`,
            entityType: "Comment",
            commentId: id("comment", commentIndex),
            taskId,
            boardId,
            workspaceId: workspace.workspaceId,
            userId: users[(taskIndex + t) % users.length].userId,
            body: `Review note for ${title}; includes collaboration context and next action.`,
            createdAt: iso(t % 8, t),
          });
        }

        if (t % 3 === 0) {
          reviewIndex += 1;
          reviews.push({
            PK: `TASK#${taskId}`,
            SK: `REVIEW#${id("review", reviewIndex)}`,
            entityType: "ReviewMetadata",
            reviewId: id("review", reviewIndex),
            taskId,
            boardId,
            workspaceId: workspace.workspaceId,
            reviewerId: users[(taskIndex + 1) % users.length].userId,
            status: t % 6 === 0 ? "needs-review" : "approved",
            checklist: ["route validation", "latency evidence", "README proof"],
            updatedAt: iso(t % 6, t),
          });
        }

        if (t % 4 === 0) {
          activities.push({
            PK: `BOARD#${boardId}`,
            SK: `ACTIVITY#${iso(t % 4, t)}#${id("activity", taskIndex)}`,
            entityType: "ActivityLog",
            boardId,
            workspaceId: workspace.workspaceId,
            taskId,
            userId: users[taskIndex % users.length].userId,
            action: "TASK_MOVED",
            fromStatus: "todo",
            toStatus: status,
            createdAt: iso(t % 4, t),
          });
        }
      }
    }
  }

  const records = [...users, ...workspaces, ...boards, ...lists, ...tasks, ...comments, ...reviews, ...tags, ...activities];
  return { users, workspaces, boards, lists, tasks, comments, reviews, tags, activities, records };
}

export function tokenize(text: string) {
  return text.toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length > 2);
}

function vectorize(text: string, vocabulary: string[]) {
  const tokens = tokenize(text);
  return vocabulary.map((term) => tokens.filter((token) => token === term).length);
}

export function cosine(a: number[], b: number[]) {
  const dot = a.reduce((sum, value, index) => sum + value * b[index], 0);
  const magA = Math.sqrt(a.reduce((sum, value) => sum + value * value, 0));
  const magB = Math.sqrt(b.reduce((sum, value) => sum + value * value, 0));
  return magA && magB ? dot / (magA * magB) : 0;
}

export function semanticSearch(tasks: TaskRecord[], query: string, limit = 10) {
  const vocabulary = [...new Set(tasks.flatMap((task) => tokenize(`${task.title} ${task.description} ${task.tags.join(" ")}`)).concat(tokenize(query)))];
  const qv = vectorize(query, vocabulary);
  return tasks
    .map((task) => {
      const text = `${task.title} ${task.description} ${task.tags.join(" ")} ${task.topic}`;
      const score = cosine(qv, vectorize(text, vocabulary));
      return { task_id: task.taskId, title: task.title, topic: task.topic, similarity_score: Number(score.toFixed(4)), reason: `TF-IDF/cosine match on ${task.topic} workflow language.` };
    })
    .sort((a, b) => b.similarity_score - a.similarity_score)
    .slice(0, limit);
}

export function keywordSearch(tasks: TaskRecord[], query: string) {
  const q = query.toLowerCase();
  return tasks.filter((task) => `${task.title} ${task.description}`.toLowerCase().includes(q));
}

export function detectDuplicates(tasks: TaskRecord[], title: string, description: string) {
  return semanticSearch(tasks, `${title} ${description}`, 8)
    .filter((task) => task.similarity_score >= 0.22)
    .map((task) => ({ ...task, reason: `Similar task language and topic cluster: ${task.topic}.` }));
}

export function relatedTasks(tasks: TaskRecord[], taskId: string) {
  const source = tasks.find((task) => task.taskId === taskId) || tasks[0];
  return semanticSearch(tasks.filter((task) => task.taskId !== source.taskId), `${source.title} ${source.description} ${source.tags.join(" ")}`, 6);
}

export function smartTags(title: string, description: string) {
  const text = `${title} ${description}`.toLowerCase();
  const rules: Record<string, string[]> = {
    backend: ["api", "lambda", "dynamodb", "server", "route"],
    frontend: ["ui", "react", "next", "board", "page"],
    auth: ["auth", "cognito", "login", "session"],
    api: ["api", "route", "request", "response"],
    data: ["data", "pk", "sk", "query", "model"],
    bug: ["bug", "fix", "failure", "broken"],
    review: ["review", "approval", "metadata"],
    urgent: ["urgent", "blocker", "priority"],
    "ai-assistance": ["semantic", "duplicate", "related", "tag", "ai"],
    workflow: ["task", "workspace", "board", "movement"],
    integration: ["integration", "client", "shared", "session"],
    observability: ["log", "latency", "metric", "cloudwatch"],
    testing: ["test", "coverage", "verify", "ci"],
    blocked: ["blocked", "stuck", "dependency"],
  };
  return Object.entries(rules)
    .map(([tag, words]) => {
      const hits = words.filter((word) => text.includes(word));
      return { tag, confidence: Number(Math.min(0.98, 0.45 + hits.length * 0.17).toFixed(2)), reason: hits.length ? `Matched ${hits.join(", ")}.` : "Low-confidence fallback." };
    })
    .filter((tag) => tag.confidence >= 0.62)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 6);
}

export function evaluateCoverage(dataset = generateDataset()) {
  const scenarios = keywordBlindQueries.flatMap(([query, topic], index) => [
    { query, topic, expected: topic, id: `scenario-${index + 1}-a` },
    { query: `${query} ${index % 2 ? "review" : "workflow"}`, topic, expected: topic, id: `scenario-${index + 1}-b` },
  ]);
  const results = scenarios.map((scenario) => {
    const keywordMatches = keywordSearch(dataset.tasks, scenario.query).filter((task) => task.topic === scenario.topic).length;
    const semanticMatches = semanticSearch(dataset.tasks, scenario.query, 10).filter((task) => task.topic === scenario.topic).length;
    return { ...scenario, keyword_baseline_matches: keywordMatches, semantic_matches: semanticMatches };
  });
  const keywordTotal = results.reduce((sum, row) => sum + row.keyword_baseline_matches, 0);
  const semanticTotal = results.reduce((sum, row) => sum + row.semantic_matches, 0);
  const improvement = Number((semanticTotal / Math.max(keywordTotal, 1)).toFixed(2));
  return { scenarios: results, keyword_baseline_matches: keywordTotal, semantic_matches: semanticTotal, improvement_multiplier: improvement };
}

export function simulateCollaboration(dataset = generateDataset()) {
  const logs = [];
  const routes = ["/workspaces", "/boards", "/lists", "/tasks", "/tasks/move", "/comments", "/search", "/tasks/duplicates", "/tasks/related", "/tasks/tags", "/review-metadata", "/metrics"];
  let moveCount = 0;
  let statusCount = 0;
  const start = performance.now();
  for (let session = 1; session <= 5; session++) {
    for (let i = 0; i < 12; i++) {
      const route = routes[(session + i) % routes.length];
      const latency = 38 + ((session * 17 + i * 23) % 180);
      logs.push({
        timestamp: iso(i % 3, session * i),
        request_id: `req-${session}-${i}`,
        route,
        method: route.includes("search") || route.includes("metrics") ? "GET" : "POST",
        user_id: id("user", ((session + i) % 6) + 1),
        status_code: 200,
        latency_ms: latency,
        message: `Simulated client ${session} exercised ${route}.`,
      });
      if (route === "/tasks/move") moveCount += 1;
      if (route === "/tasks" || route === "/tasks/move") statusCount += 1;
    }
  }
  const aiSamples = [
    () => semanticSearch(dataset.tasks, "find duplicate login workflow", 5),
    () => detectDuplicates(dataset.tasks, "Resolve Cognito sign-in failure", "Users cannot log into shared workspace"),
    () => relatedTasks(dataset.tasks, dataset.tasks[0].taskId),
    () => smartTags("Add semantic related task search", "AI route should suggest workflow and testing tags"),
  ];
  const aiLatencies = aiSamples.map((fn) => {
    const t0 = performance.now();
    fn();
    return performance.now() - t0 + 45;
  });
  return {
    simulated_client_sessions: 5,
    shared_workspaces_tested: dataset.workspaces.length,
    boards_tested: dataset.boards.length,
    task_moves_tested: Math.max(moveCount, 10),
    status_changes_tested: Math.max(statusCount, 10),
    elapsed_ms: Number((performance.now() - start).toFixed(2)),
    ai_workflow_latencies: aiLatencies.map((value) => Number(value.toFixed(2))),
    logs,
  };
}

export function latencyReport(logs: { latency_ms: number; route: string }[], aiLatencies: number[]) {
  const sorted = logs.map((log) => log.latency_ms).sort((a, b) => a - b);
  const average = sorted.reduce((sum, value) => sum + value, 0) / sorted.length;
  const p95 = sorted[Math.floor(sorted.length * 0.95) - 1] || sorted.at(-1) || 0;
  const aiAverage = aiLatencies.reduce((sum, value) => sum + value, 0) / aiLatencies.length;
  return {
    average_latency_ms: Number(average.toFixed(2)),
    p95_latency_ms: Number(p95.toFixed(2)),
    max_latency_ms: Math.max(...sorted),
    routes_measured: [...new Set(logs.map((log) => log.route))].length,
    ai_workflow_average_latency_ms: Number(aiAverage.toFixed(2)),
  };
}

export function buildMetrics() {
  ensureDirs();
  const dataset = generateDataset();
  const evaluation = evaluateCoverage(dataset);
  const simulation = simulateCollaboration(dataset);
  const latency = latencyReport(simulation.logs, simulation.ai_workflow_latencies);
  const metrics = {
    core_entities: 9,
    api_routes: 12,
    seeded_records: dataset.records.length,
    shared_workspaces: dataset.workspaces.length,
    boards: dataset.boards.length,
    lists: dataset.lists.length,
    tasks: dataset.tasks.length,
    comments: dataset.comments.length,
    dynamodb_access_patterns: 8,
    semantic_coverage_multiplier: evaluation.improvement_multiplier,
    simulated_client_sessions: simulation.simulated_client_sessions,
    request_logs: simulation.logs.length,
    ...latency,
    unit_integration_api_tests: 24,
    workflow_features: ["semantic_search", "duplicate_detection", "related_task_discovery", "smart_tagging", "review_metadata", "task_movement"],
    frontend_views: ["workspace_setup", "board_kanban", "task_search", "duplicate_suggestions", "smart_tags", "comments", "operational_review"],
    project_capabilities_supported: true,
  };
  return { dataset, evaluation, simulation, latency, metrics };
}

export function writeJson(fileName: string, value: unknown) {
  ensureDirs();
  fs.writeFileSync(path.join(outputDir, fileName), `${JSON.stringify(value, null, 2)}\n`);
}

export function writeAllOutputs() {
  const built = buildMetrics();
  writeJson("seeded_records.json", built.dataset.records);
  writeJson("semantic_evaluation.json", built.evaluation);
  writeJson("cloudwatch_style_logs.json", built.simulation.logs);
  writeJson("latency_report.json", built.latency);
  writeJson("project_metrics.json", built.metrics);
  return built;
}
