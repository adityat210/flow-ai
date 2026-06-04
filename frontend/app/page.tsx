"use client";

import { useEffect, useState } from "react";
import {
  addWorkspaceMember,
  createBoard,
  createComment,
  createTask,
  createUser,
  createWorkspace,
  getBoard,
  getComments,
  getWorkspaceMembers,
  updateTask,
} from "../lib/api";
import { confirmSignUp, signIn, signUp } from "../lib/auth";

type BoardItem = {
  PK: string;
  SK: string;
  boardId?: string;
  taskId?: string;
  name?: string;
  title?: string;
  description?: string;
  columnId?: string;
  status?: string;
  position?: number;
  createdAt?: string;
  userId?: string;
  role?: string;
  relevanceScore?: number;
  similarity?: number;
  tags?: string[];
  reviewStatus?: string;
  relatedTaskIds?: string[];
};

type CommentItem = {
  commentId: string;
  taskId: string;
  userId: string;
  body: string;
  createdAt: string;
};

const columns = [
  { id: "todo", label: "Todo" },
  { id: "in-progress", label: "In Progress" },
  { id: "done", label: "Done" },
];

const demoTasks: BoardItem[] = [
  {
    PK: "BOARD#demo-board",
    SK: "TASK#demo-001",
    boardId: "demo-board",
    taskId: "demo-001",
    title: "Plan physics lab milestone checklist",
    description:
      "Break the lab writeup into data cleaning, graphing, uncertainty notes, and final review.",
    columnId: "todo",
    status: "todo",
    position: 1,
    tags: ["testing", "review", "workflow"],
    reviewStatus: "needs-review",
    relatedTaskIds: ["demo-006", "demo-009"],
  },
  {
    PK: "BOARD#demo-board",
    SK: "TASK#demo-002",
    boardId: "demo-board",
    taskId: "demo-002",
    title: "Build AI duplicate-detection route",
    description:
      "Use local semantic scoring to flag repeated task requests before they clutter the board.",
    columnId: "in-progress",
    status: "in-progress",
    position: 2,
    tags: ["ai-assistance", "api", "backend"],
    reviewStatus: "in-review",
    relatedTaskIds: ["demo-003", "demo-007"],
  },
  {
    PK: "BOARD#demo-board",
    SK: "TASK#demo-003",
    boardId: "demo-board",
    taskId: "demo-003",
    title: "Surface related assignments across boards",
    description:
      "Find similar work across team projects, personal assignments, and goals using semantic retrieval.",
    columnId: "todo",
    status: "todo",
    position: 3,
    tags: ["ai-assistance", "workflow", "data"],
    reviewStatus: "ready",
    relatedTaskIds: ["demo-002", "demo-010"],
  },
  {
    PK: "BOARD#demo-board",
    SK: "TASK#demo-004",
    boardId: "demo-board",
    taskId: "demo-004",
    title: "Add CloudWatch-style latency report",
    description:
      "Log route, method, user, request id, status code, and latency for each simulated workflow action.",
    columnId: "done",
    status: "done",
    position: 4,
    tags: ["observability", "backend", "testing"],
    reviewStatus: "approved",
    relatedTaskIds: ["demo-008"],
  },
  {
    PK: "BOARD#demo-board",
    SK: "TASK#demo-005",
    boardId: "demo-board",
    taskId: "demo-005",
    title: "Polish board UI tag chips",
    description:
      "Make smart tags visible on each card so reviewers can inspect the functional demo at a glance.",
    columnId: "in-progress",
    status: "in-progress",
    position: 5,
    tags: ["frontend", "review", "smart-tags"],
    reviewStatus: "needs-review",
    relatedTaskIds: ["demo-011"],
  },
  {
    PK: "BOARD#demo-board",
    SK: "TASK#demo-006",
    boardId: "demo-board",
    taskId: "demo-006",
    title: "Finish economics problem set plan",
    description:
      "Track readings, chart screenshots, written answers, and final submission checklist.",
    columnId: "todo",
    status: "todo",
    position: 6,
    tags: ["assignment", "workflow", "blocked"],
    reviewStatus: "blocked",
    relatedTaskIds: ["demo-001"],
  },
  {
    PK: "BOARD#demo-board",
    SK: "TASK#demo-007",
    boardId: "demo-board",
    taskId: "demo-007",
    title: "Detect repeated lab writeup tasks",
    description:
      "Compare similar titles and descriptions so duplicate schoolwork tasks are grouped together.",
    columnId: "done",
    status: "done",
    position: 7,
    tags: ["duplicate-detection", "ai-assistance", "testing"],
    reviewStatus: "approved",
    relatedTaskIds: ["demo-002", "demo-001"],
  },
  {
    PK: "BOARD#demo-board",
    SK: "TASK#demo-008",
    boardId: "demo-board",
    taskId: "demo-008",
    title: "Simulate five concurrent client sessions",
    description:
      "Exercise task movement, comments, search, duplicate detection, smart tags, and review state.",
    columnId: "done",
    status: "done",
    position: 8,
    tags: ["integration", "testing", "observability"],
    reviewStatus: "approved",
    relatedTaskIds: ["demo-004"],
  },
  {
    PK: "BOARD#demo-board",
    SK: "TASK#demo-009",
    boardId: "demo-board",
    taskId: "demo-009",
    title: "Review team project responsibilities",
    description:
      "Separate owner, reviewer, and blocked work so shared goals stay visible before meetings.",
    columnId: "in-progress",
    status: "in-progress",
    position: 9,
    tags: ["teamwork", "review", "workflow"],
    reviewStatus: "in-review",
    relatedTaskIds: ["demo-001", "demo-003"],
  },
  {
    PK: "BOARD#demo-board",
    SK: "TASK#demo-010",
    boardId: "demo-board",
    taskId: "demo-010",
    title: "Document DynamoDB PK/SK examples",
    description:
      "Explain workspace-to-board traversal, sorted task retrieval, review metadata, and tag lookup.",
    columnId: "todo",
    status: "todo",
    position: 10,
    tags: ["data", "backend", "documentation"],
    reviewStatus: "ready",
    relatedTaskIds: ["demo-003"],
  },
  {
    PK: "BOARD#demo-board",
    SK: "TASK#demo-011",
    boardId: "demo-board",
    taskId: "demo-011",
    title: "Create README proof screenshots",
    description:
      "Capture the populated FlowIntel UI and deterministic metrics output for project documentation.",
    columnId: "done",
    status: "done",
    position: 11,
    tags: ["documentation", "frontend", "review"],
    reviewStatus: "approved",
    relatedTaskIds: ["demo-005"],
  },
  {
    PK: "BOARD#demo-board",
    SK: "TASK#demo-012",
    boardId: "demo-board",
    taskId: "demo-012",
    title: "Prepare goal review for the week",
    description:
      "Group personal deadlines, shared project blockers, and follow-up tasks into one planning board.",
    columnId: "todo",
    status: "todo",
    position: 12,
    tags: ["goals", "workflow", "review"],
    reviewStatus: "ready",
    relatedTaskIds: ["demo-009"],
  },
];

const demoComments: Record<string, CommentItem[]> = {
  "demo-001": [
    {
      commentId: "comment-demo-001",
      taskId: "demo-001",
      userId: "demo-user",
      body: "Split the lab work before Thursday so the final review is not rushed.",
      createdAt: "2026-06-04T16:00:00.000Z",
    },
  ],
  "demo-002": [
    {
      commentId: "comment-demo-002",
      taskId: "demo-002",
      userId: "demo-user",
      body: "Duplicate check should catch differently worded but related work.",
      createdAt: "2026-06-04T16:05:00.000Z",
    },
  ],
  "demo-009": [
    {
      commentId: "comment-demo-009",
      taskId: "demo-009",
      userId: "demo-user",
      body: "Use this before team meetings to see blockers and review ownership.",
      createdAt: "2026-06-04T16:10:00.000Z",
    },
  ],
};

export default function Home() {
  const [boardId, setBoardId] = useState("");
  const [workspaceId, setWorkspaceId] = useState("");
  const [userId, setUserId] = useState("");
  const [members, setMembers] = useState<BoardItem[]>([]);
  const [boardItems, setBoardItems] = useState<BoardItem[]>([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const [commentsByTask, setCommentsByTask] = useState<
    Record<string, CommentItem[]>
  >({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>(
    {}
  );

  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [confirmCode, setConfirmCode] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [authMessage, setAuthMessage] = useState("");

  const [realtimeStatus, setRealtimeStatus] = useState("Disconnected");

  const [aiSuggestions, setAiSuggestions] = useState<BoardItem[]>([]);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<BoardItem[]>([]);
  const [searchCacheHit, setSearchCacheHit] = useState<boolean | null>(null);

  const refreshCommentsForTasks = async (tasksToLoad: BoardItem[]) => {
    const nextComments: Record<string, CommentItem[]> = {};

    await Promise.all(
      tasksToLoad.map(async (task) => {
        if (!task.taskId) return;
        const comments = await getComments(task.taskId);
        nextComments[task.taskId] = comments;
      })
    );

    setCommentsByTask(nextComments);
  };

  const refreshBoard = async (id: string) => {
    const items = await getBoard(id);
    setBoardItems(items);

    const loadedTasks = items.filter((item: BoardItem) =>
      item.SK?.startsWith("TASK#")
    );

    await refreshCommentsForTasks(loadedTasks);
  };

  useEffect(() => {
    const savedWorkspace = localStorage.getItem("tasksync-workspace-id");
    const savedBoard = localStorage.getItem("tasksync-board-id");
    const savedUser = localStorage.getItem("tasksync-user-id");
    const savedToken = localStorage.getItem("tasksync-auth-token");
    const savedEmail = localStorage.getItem("tasksync-auth-email");

    if (savedToken) setAuthToken(savedToken);
    if (savedEmail) setAuthEmail(savedEmail);
    if (savedUser) setUserId(savedUser);

    if (savedWorkspace) {
      setWorkspaceId(savedWorkspace);
      getWorkspaceMembers(savedWorkspace).then(setMembers);
    }

    if (savedBoard) {
      setBoardId(savedBoard);
      refreshBoard(savedBoard);
    }
  }, []);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;

    if (!wsUrl) return;

    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      setRealtimeStatus("Connected");
      console.log("WebSocket connected");
    };

    socket.onclose = () => {
      setRealtimeStatus("Disconnected");
      console.log("WebSocket disconnected");
    };

    socket.onerror = (error) => {
      setRealtimeStatus("Error");
      console.error("WebSocket error:", error);
    };

    socket.onmessage = async (event) => {
      console.log("WebSocket message:", event.data);

      try {
        const data = JSON.parse(event.data);

        if (data.type === "BOARD_UPDATED" && data.boardId === boardId) {
          await refreshBoard(boardId);
        }
      } catch (err) {
        console.error("Invalid WS message:", err);
      }
    };

    return () => {
      socket.close();
    };
  }, [boardId]);

  const handleSignUp = async () => {
    if (!authEmail || !authPassword) return;

    try {
      setAuthMessage("Creating account...");
      await signUp(authEmail, authPassword);
      setAuthMessage(
        "Signup successful. Check your email for a confirmation code."
      );
    } catch (error: any) {
      setAuthMessage(error.message || "Signup failed.");
    }
  };

  const handleConfirmSignUp = async () => {
    if (!authEmail || !confirmCode) return;

    try {
      setAuthMessage("Confirming account...");
      await confirmSignUp(authEmail, confirmCode);
      setAuthMessage("Account confirmed. You can now log in.");
    } catch (error: any) {
      setAuthMessage(error.message || "Confirmation failed.");
    }
  };

  const handleSignIn = async () => {
    if (!authEmail || !authPassword) return;

    try {
      setAuthMessage("Signing in...");
      const token = await signIn(authEmail, authPassword);

      setAuthToken(token);
      localStorage.setItem("tasksync-auth-token", token);
      localStorage.setItem("tasksync-auth-email", authEmail);

      setAuthMessage("Signed in successfully.");
    } catch (error: any) {
      setAuthMessage(error.message || "Login failed.");
    }
  };

  const handleSignOut = () => {
    setAuthToken("");
    localStorage.removeItem("tasksync-auth-token");
    localStorage.removeItem("tasksync-auth-email");
    setAuthMessage("Signed out.");
  };

  const ensureDemoUser = async () => {
    let currentUserId = userId;

    if (!currentUserId) {
      const user = await createUser({
        name: authEmail || "Adi",
        email: authEmail || "adi@example.com",
      });

      currentUserId = user.userId;
      setUserId(currentUserId);
      localStorage.setItem("tasksync-user-id", currentUserId);
    }

    return currentUserId;
  };

  const handleCreateBoard = async () => {
    setLoading(true);

    let wsId = workspaceId;
    const currentUserId = await ensureDemoUser();

    if (!wsId) {
      const ws = await createWorkspace("Adi Workspace");
      wsId = ws.workspaceId;

      setWorkspaceId(wsId);
      localStorage.setItem("tasksync-workspace-id", wsId);

      await addWorkspaceMember(wsId, {
        userId: currentUserId,
        role: "owner",
      });

      const workspaceMembers = await getWorkspaceMembers(wsId);
      setMembers(workspaceMembers);
    }

    const board = await createBoard(wsId, "Adi's First Board");

    setBoardId(board.boardId);
    localStorage.setItem("tasksync-board-id", board.boardId);

    await refreshBoard(board.boardId);
    setLoading(false);
  };

  const handleAnalyzeTask = async () => {
    if (!taskTitle.trim()) return;

    setAnalyzing(true);

    if (boardId === "demo-board") {
      const query = taskTitle.toLowerCase();
      const localTags = [
        query.includes("assignment") ? "assignment" : "workflow",
        query.includes("block") ? "blocked" : "review",
        query.includes("semantic") || query.includes("ai")
          ? "ai-assistance"
          : "goals",
      ];
      const localSuggestions = demoTasks
        .map((task) => {
          const text = `${task.title} ${task.description} ${task.tags?.join(" ")}`.toLowerCase();
          const overlap = query
            .split(/\s+/)
            .filter((term) => term.length > 2 && text.includes(term)).length;

          return {
            ...task,
            similarity: Math.min(0.98, 0.35 + overlap * 0.16),
          };
        })
        .filter((task) => (task.similarity || 0) > 0.45)
        .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
        .slice(0, 4);

      setSuggestedTags([...new Set(localTags)]);
      setAiSuggestions(localSuggestions);
      setAnalyzing(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspaceId: workspaceId || undefined,
          title: taskTitle,
          description: "",
        }),
      });

      const data = await res.json();

      setAiSuggestions(data.possibleDuplicates || []);
      setSuggestedTags(data.suggestedTags || []);
    } catch (err) {
      console.error("Analyze failed:", err);
    }

    setAnalyzing(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    if (boardId === "demo-board") {
      const query = searchQuery.toLowerCase();
      const results = demoTasks
        .map((task) => {
          const text = `${task.title} ${task.description} ${task.tags?.join(" ")}`;
          const lowerText = text.toLowerCase();
          const relevanceScore = query
            .split(/\s+/)
            .filter((term) => term.length > 2 && lowerText.includes(term))
            .length;

          return {
            ...task,
            relevanceScore:
              relevanceScore > 0 ? relevanceScore * 25 : lowerText.includes(query) ? 20 : 0,
          };
        })
        .filter((task) => task.relevanceScore > 0)
        .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

      setSearchResults(results);
      setSearchCacheHit(false);
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/search?q=${encodeURIComponent(
          searchQuery
        )}${workspaceId ? `&workspaceId=${workspaceId}` : ""}`
      );

      const data = await res.json();

      setSearchResults(data.results || []);
      setSearchCacheHit(Boolean(data.cacheHit));
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  const handleCreateTask = async () => {
    if (!boardId || !taskTitle.trim()) return;

    if (boardId === "demo-board") {
      const newTask: BoardItem = {
        PK: "BOARD#demo-board",
        SK: `TASK#demo-${Date.now()}`,
        boardId: "demo-board",
        taskId: `demo-${Date.now()}`,
        title: taskTitle,
        description: "Locally added demo task for balancing assignments and goals.",
        columnId: "todo",
        status: "todo",
        position: tasks.length + 1,
        tags: suggestedTags.length > 0 ? suggestedTags : ["workflow", "goals"],
        reviewStatus: "ready",
      };

      setBoardItems((prev) => [...prev, newTask]);
      setTaskTitle("");
      setAiSuggestions([]);
      setSuggestedTags([]);
      return;
    }

    setLoading(true);

    await createTask(boardId, {
      title: taskTitle,
      description: "",
      columnId: "todo",
      position: 0,
    });

    setTaskTitle("");
    setAiSuggestions([]);
    setSuggestedTags([]);
    await refreshBoard(boardId);
    setLoading(false);
  };

  const handleMoveTask = async (task: BoardItem, newColumnId: string) => {
    if (!boardId || !task.taskId || !task.title) return;

    if (boardId === "demo-board") {
      setBoardItems((prev) =>
        prev.map((item) =>
          item.taskId === task.taskId
            ? { ...item, columnId: newColumnId, status: newColumnId }
            : item
        )
      );
      return;
    }

    setLoading(true);

    await updateTask(boardId, task.taskId, {
      title: task.title,
      description: task.description || "",
      columnId: newColumnId,
      status: newColumnId,
      position: task.position ?? 0,
    });

    await refreshBoard(boardId);
    setLoading(false);
  };

  const handleAddComment = async (task: BoardItem) => {
    if (!task.taskId || !userId) return;

    const commentBody = commentInputs[task.taskId]?.trim();
    if (!commentBody) return;

    if (boardId === "demo-board") {
      const comment = {
        commentId: `comment-${Date.now()}`,
        taskId: task.taskId,
        userId,
        body: commentBody,
        createdAt: new Date().toISOString(),
      };

      setCommentInputs((prev) => ({
        ...prev,
        [task.taskId!]: "",
      }));

      setCommentsByTask((prev) => ({
        ...prev,
        [task.taskId!]: [...(prev[task.taskId!] || []), comment],
      }));
      return;
    }

    setLoading(true);

    await createComment(task.taskId, {
      userId,
      body: commentBody,
    });

    setCommentInputs((prev) => ({
      ...prev,
      [task.taskId!]: "",
    }));

    const comments = await getComments(task.taskId);

    setCommentsByTask((prev) => ({
      ...prev,
      [task.taskId!]: comments,
    }));

    setLoading(false);
  };

  const handleClearBoard = () => {
    localStorage.removeItem("tasksync-board-id");
    localStorage.removeItem("tasksync-workspace-id");
    localStorage.removeItem("tasksync-user-id");

    setBoardId("");
    setWorkspaceId("");
    setUserId("");
    setMembers([]);
    setTaskTitle("");
    setBoardItems([]);
    setCommentsByTask({});
    setCommentInputs({});
    setAiSuggestions([]);
    setSuggestedTags([]);
    setSearchQuery("");
    setSearchResults([]);
    setSearchCacheHit(null);
  };

  const handleLoadDemoBoard = () => {
    const demoWorkspaceId = "demo-workspace";
    const demoBoardId = "demo-board";
    const demoUserId = userId || "demo-user";

    setWorkspaceId(demoWorkspaceId);
    setBoardId(demoBoardId);
    setUserId(demoUserId);
    setMembers([
      {
        PK: "WORKSPACE#demo-workspace",
        SK: "MEMBER#demo-user",
        userId: demoUserId,
        role: "owner",
      },
      {
        PK: "WORKSPACE#demo-workspace",
        SK: "MEMBER#demo-teammate",
        userId: "demo-teammate",
        role: "reviewer",
      },
    ]);
    setBoardItems([
      {
        PK: "BOARD#demo-board",
        SK: "METADATA",
        boardId: demoBoardId,
        name: "FlowIntel Demo Board",
      },
      ...demoTasks,
    ]);
    setCommentsByTask(demoComments);
    setTaskTitle("Add semantic reminder for assignment blockers");
    setSuggestedTags(["ai-assistance", "workflow", "blocked"]);
    setAiSuggestions([
      { ...demoTasks[1], similarity: 0.86 },
      { ...demoTasks[6], similarity: 0.79 },
    ]);
    setSearchQuery("assignment review workflow");
    setSearchResults(demoTasks.slice(0, 6).map((task, index) => ({
      ...task,
      relevanceScore: 100 - index * 9,
    })));
    setSearchCacheHit(false);

    localStorage.setItem("tasksync-workspace-id", demoWorkspaceId);
    localStorage.setItem("tasksync-board-id", demoBoardId);
    localStorage.setItem("tasksync-user-id", demoUserId);
  };

  const boardMetadata = boardItems.find((item) => item.SK === "METADATA");

  const tasks = boardItems.filter((item) => item.SK?.startsWith("TASK#"));

  const getTaskColumnId = (task: BoardItem) => {
    return task.columnId || task.status || "todo";
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f7fb",
        padding: "40px",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: "#111827",
      }}
    >
      <section style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            marginBottom: 32,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 24,
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                color: "#6366f1",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontSize: 12,
              }}
            >
              FlowIntel
            </p>

            <h1 style={{ margin: "8px 0", fontSize: 42, lineHeight: 1.1 }}>
              AI workflow balance for teams, assignments, and goals.
            </h1>

            <p
              style={{
                margin: 0,
                color: "#6b7280",
                fontSize: 16,
                maxWidth: 620,
              }}
            >
              Coordinate shared workspaces, personal assignments, project boards,
              duplicate detection, related-task discovery, smart tags, comments,
              and review visibility using an AWS-style serverless architecture.
            </p>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleLoadDemoBoard}
              style={{
                border: "1px solid #c7d2fe",
                background: "#eef2ff",
                color: "#3730a3",
                padding: "10px 16px",
                borderRadius: 10,
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Load Demo Board
            </button>

            <button
              onClick={handleCreateBoard}
              disabled={loading || !authToken}
              style={{
                border: "none",
                background: "#111827",
                color: "white",
                padding: "10px 16px",
                borderRadius: 10,
                cursor: loading || !authToken ? "not-allowed" : "pointer",
                fontWeight: 600,
              }}
            >
              {loading ? "Loading..." : authToken ? "Create Board" : "Sign in first"}
            </button>

            {boardId && (
              <button
                onClick={handleClearBoard}
                disabled={loading}
                style={{
                  border: "1px solid #d1d5db",
                  background: "white",
                  color: "#374151",
                  padding: "10px 16px",
                  borderRadius: 10,
                  cursor: loading ? "not-allowed" : "pointer",
                  fontWeight: 600,
                }}
              >
                Clear Board
              </button>
            )}
          </div>
        </div>

        <div
          style={{
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 20 }}>Account</h2>

          <p style={{ margin: "8px 0 16px", color: "#6b7280", fontSize: 14 }}>
            {authToken
              ? `Signed in as ${authEmail}`
              : "Create or sign into a Cognito-backed account, or use local simulation when AWS env vars are absent."}
          </p>

          {!authToken ? (
            <>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <input
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="Email"
                  style={{
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: 10,
                    minWidth: 220,
                  }}
                />

                <input
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="Password"
                  type="password"
                  style={{
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: 10,
                    minWidth: 220,
                  }}
                />

                <button
                  onClick={handleSignUp}
                  style={{
                    border: "none",
                    background: "#4f46e5",
                    color: "white",
                    padding: "10px 14px",
                    borderRadius: 10,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Sign Up
                </button>

                <button
                  onClick={handleSignIn}
                  style={{
                    border: "none",
                    background: "#111827",
                    color: "white",
                    padding: "10px 14px",
                    borderRadius: 10,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Log In
                </button>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <input
                  value={confirmCode}
                  onChange={(e) => setConfirmCode(e.target.value)}
                  placeholder="Confirmation code"
                  style={{
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: 10,
                    minWidth: 220,
                  }}
                />

                <button
                  onClick={handleConfirmSignUp}
                  style={{
                    border: "1px solid #d1d5db",
                    background: "white",
                    color: "#374151",
                    padding: "10px 14px",
                    borderRadius: 10,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Confirm
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={handleSignOut}
              style={{
                border: "1px solid #d1d5db",
                background: "white",
                color: "#374151",
                padding: "10px 14px",
                borderRadius: 10,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Sign Out
            </button>
          )}

          {authMessage && (
            <p style={{ margin: "12px 0 0", color: "#6b7280", fontSize: 13 }}>
              {authMessage}
            </p>
          )}
        </div>

        {!authToken ? (
          <div
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: 16,
              padding: 32,
              boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Sign in to access your FlowIntel workspace</h2>
            <p style={{ color: "#6b7280", marginBottom: 0 }}>
              Create or log into a Cognito-style account before balancing team
              work, personal assignments, and goals across boards.
            </p>
          </div>
        ) : boardId ? (
          <section>
            <div
              style={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: 16,
                padding: 20,
                marginBottom: 24,
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
              }}
            >
              <h2 style={{ margin: 0, fontSize: 24 }}>
                {boardMetadata?.name || "Current Board"}
              </h2>

              <p style={{ margin: "8px 0 0", color: "#6b7280", fontSize: 13 }}>
                Board ID: {boardId}
              </p>

              <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: 13 }}>
                Workspace ID: {workspaceId}
              </p>

              <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: 13 }}>
                App User ID: {userId || "Not created yet"}
              </p>

              <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: 13 }}>
                Members: {members.length}
              </p>

              <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: 13 }}>
                Realtime: {realtimeStatus}
              </p>

              <div style={{ marginTop: 20 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateTask();
                    }}
                    placeholder="Add a new task..."
                    style={{
                      flex: 1,
                      padding: "12px 14px",
                      border: "1px solid #d1d5db",
                      borderRadius: 10,
                      fontSize: 15,
                      outline: "none",
                    }}
                  />

                  <button
                    onClick={handleAnalyzeTask}
                    disabled={!taskTitle.trim() || analyzing}
                    style={{
                      border: "none",
                      background:
                        !taskTitle.trim() || analyzing ? "#9ca3af" : "#6366f1",
                      color: "white",
                      padding: "12px 14px",
                      borderRadius: 10,
                      fontWeight: 700,
                      cursor:
                        !taskTitle.trim() || analyzing ? "not-allowed" : "pointer",
                    }}
                  >
                    {analyzing ? "Analyzing..." : "Analyze"}
                  </button>

                  <button
                    onClick={handleCreateTask}
                    disabled={loading || !taskTitle.trim()}
                    style={{
                      border: "none",
                      background:
                        loading || !taskTitle.trim() ? "#9ca3af" : "#4f46e5",
                      color: "white",
                      padding: "12px 18px",
                      borderRadius: 10,
                      cursor:
                        loading || !taskTitle.trim()
                          ? "not-allowed"
                          : "pointer",
                      fontWeight: 700,
                    }}
                  >
                    Add Task
                  </button>
                </div>

                {(aiSuggestions.length > 0 || suggestedTags.length > 0) && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: 12,
                      background: "#f9fafb",
                      border: "1px solid #e5e7eb",
                      borderRadius: 10,
                    }}
                  >
                    {suggestedTags.length > 0 && (
                      <p style={{ margin: 0, fontSize: 13 }}>
                        <strong>Suggested Tags:</strong>{" "}
                        {suggestedTags.join(", ")}
                      </p>
                    )}

                    {aiSuggestions.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <strong style={{ fontSize: 13 }}>
                          Possible Duplicates:
                        </strong>
                        <ul style={{ margin: "6px 0 0", paddingLeft: 16 }}>
                          {aiSuggestions.map((task) => (
                            <li key={task.taskId} style={{ fontSize: 13 }}>
                              {task.title}
                              {typeof task.similarity === "number"
                                ? ` (${task.similarity.toFixed(2)})`
                                : ""}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearch();
                    }}
                    placeholder="Search seeded tasks..."
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: 10,
                    }}
                  />

                  <button
                    onClick={handleSearch}
                    disabled={!searchQuery.trim()}
                    style={{
                      border: "none",
                      background: !searchQuery.trim() ? "#9ca3af" : "#111827",
                      color: "white",
                      padding: "10px 14px",
                      borderRadius: 10,
                      fontWeight: 700,
                      cursor: !searchQuery.trim() ? "not-allowed" : "pointer",
                    }}
                  >
                    Search
                  </button>
                </div>

                {searchResults.length > 0 && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: 12,
                      background: "#f9fafb",
                      border: "1px solid #e5e7eb",
                      borderRadius: 10,
                    }}
                  >
                    <strong style={{ fontSize: 13 }}>
                      Search Results{" "}
                      {searchCacheHit !== null &&
                        `(Redis cache: ${searchCacheHit ? "hit" : "miss"})`}
                    </strong>

                    <ul style={{ margin: "6px 0 0", paddingLeft: 16 }}>
                      {searchResults.slice(0, 8).map((task) => (
                        <li key={task.taskId} style={{ fontSize: 13 }}>
                          {task.title}
                          {typeof task.relevanceScore === "number"
                            ? ` — score ${task.relevanceScore}`
                            : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 20,
              }}
            >
              {columns.map((column) => {
                const columnTasks = tasks.filter(
                  (task) => getTaskColumnId(task) === column.id
                );

                return (
                  <div
                    key={column.id}
                    style={{
                      background: "#eef0f6",
                      border: "1px solid #e5e7eb",
                      borderRadius: 16,
                      padding: 16,
                      minHeight: 360,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 12,
                      }}
                    >
                      <h3 style={{ margin: 0, fontSize: 16 }}>
                        {column.label}
                      </h3>

                      <span
                        style={{
                          background: "white",
                          border: "1px solid #d1d5db",
                          borderRadius: 999,
                          padding: "2px 8px",
                          fontSize: 12,
                          color: "#6b7280",
                          fontWeight: 700,
                        }}
                      >
                        {columnTasks.length}
                      </span>
                    </div>

                    {columnTasks.length === 0 && (
                      <p
                        style={{
                          color: "#9ca3af",
                          fontSize: 14,
                          marginTop: 24,
                        }}
                      >
                        No tasks yet.
                      </p>
                    )}

                    {columnTasks.map((task) => (
                      <div
                        key={task.taskId}
                        style={{
                          background: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: 14,
                          padding: 14,
                          marginTop: 12,
                          boxShadow: "0 8px 18px rgba(15, 23, 42, 0.06)",
                        }}
                      >
                        <strong
                          style={{
                            display: "block",
                            fontSize: 15,
                            marginBottom: 8,
                          }}
                        >
                          {task.title}
                        </strong>

                        <p
                          style={{
                            margin: 0,
                            color: "#6b7280",
                            fontSize: 12,
                          }}
                        >
                          Status: {column.label}
                        </p>

                        {task.description && (
                          <p
                            style={{
                              margin: "8px 0 0",
                              color: "#4b5563",
                              fontSize: 12,
                              lineHeight: 1.4,
                            }}
                          >
                            {task.description}
                          </p>
                        )}

                        {(task.tags || []).length > 0 && (
                          <div
                            style={{
                              marginTop: 10,
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 6,
                            }}
                          >
                            {(task.tags || []).map((tag) => (
                              <span
                                key={tag}
                                style={{
                                  background: "#eef2ff",
                                  border: "1px solid #c7d2fe",
                                  color: "#3730a3",
                                  borderRadius: 999,
                                  padding: "3px 8px",
                                  fontSize: 11,
                                  fontWeight: 700,
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {task.reviewStatus && (
                          <p
                            style={{
                              margin: "10px 0 0",
                              color: "#047857",
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            Review: {task.reviewStatus}
                          </p>
                        )}

                        <div
                          style={{
                            marginTop: 14,
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 8,
                          }}
                        >
                          {columns
                            .filter(
                              (target) => target.id !== getTaskColumnId(task)
                            )
                            .map((target) => (
                              <button
                                key={target.id}
                                onClick={() => handleMoveTask(task, target.id)}
                                disabled={loading}
                                style={{
                                  border: "1px solid #d1d5db",
                                  background: "white",
                                  color: "#374151",
                                  borderRadius: 999,
                                  padding: "6px 10px",
                                  fontSize: 12,
                                  cursor: loading ? "not-allowed" : "pointer",
                                }}
                              >
                                Move to {target.label}
                              </button>
                            ))}
                        </div>

                        <div style={{ marginTop: 14 }}>
                          <input
                            value={commentInputs[task.taskId || ""] || ""}
                            onChange={(e) =>
                              setCommentInputs((prev) => ({
                                ...prev,
                                [task.taskId || ""]: e.target.value,
                              }))
                            }
                            placeholder="Add a comment..."
                            style={{
                              width: "100%",
                              padding: "8px 10px",
                              border: "1px solid #d1d5db",
                              borderRadius: 8,
                              fontSize: 13,
                              boxSizing: "border-box",
                            }}
                          />

                          <button
                            onClick={() => handleAddComment(task)}
                            disabled={loading || !task.taskId || !userId}
                            style={{
                              marginTop: 8,
                              border: "none",
                              background: "#111827",
                              color: "white",
                              borderRadius: 8,
                              padding: "7px 10px",
                              fontSize: 12,
                              cursor: loading ? "not-allowed" : "pointer",
                            }}
                          >
                            Comment
                          </button>

                          {(commentsByTask[task.taskId || ""] || []).length >
                            0 && (
                            <div style={{ marginTop: 10 }}>
                              {(commentsByTask[task.taskId || ""] || []).map(
                                (comment) => (
                                  <div
                                    key={comment.commentId}
                                    style={{
                                      background: "#f9fafb",
                                      border: "1px solid #e5e7eb",
                                      borderRadius: 8,
                                      padding: 8,
                                      marginTop: 6,
                                      fontSize: 12,
                                    }}
                                  >
                                    <strong>
                                      {comment.userId.slice(0, 8)}
                                    </strong>
                                    : {comment.body}
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </section>
        ) : (
          <div
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: 16,
              padding: 32,
              boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
            }}
          >
            <h2 style={{ marginTop: 0 }}>No active board yet</h2>
            <p style={{ color: "#6b7280", marginBottom: 0 }}>
              Create a board to start adding and moving tasks.
            </p>
            <button
              onClick={handleLoadDemoBoard}
              style={{
                marginTop: 20,
                border: "none",
                background: "#4f46e5",
                color: "white",
                padding: "12px 16px",
                borderRadius: 10,
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Load Demo Board
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
