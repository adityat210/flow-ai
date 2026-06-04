# FlowIntel Data Model

FlowIntel uses a DynamoDB-style single-table model so team work, personal assignments, and goals can be traversed through predictable PK/SK access patterns.

## Entities

- `User`: local Cognito-style user identity.
- `Workspace`: shared project or assignment space.
- `Board`: workflow board inside a workspace.
- `List`: ordered board column.
- `Task`: work item with status, priority, tags, and semantic-search text.
- `Comment`: task discussion.
- `ReviewMetadata`: operational review state and checklist.
- `SmartTag`: tag-to-task lookup record with confidence and reason.
- `ActivityLog`: task movement and collaboration history.

## PK/SK Access Patterns

| Pattern | Purpose |
| --- | --- |
| `WORKSPACE#<workspaceId>` / `METADATA` | Workspace lookup |
| `WORKSPACE#<workspaceId>` / `BOARD#<boardId>` | Workspace-to-board traversal |
| `BOARD#<boardId>` / `LIST#<listId>` | Sorted list retrieval |
| `BOARD#<boardId>` / `TASK#<taskId>` | Board task retrieval and movement |
| `TASK#<taskId>` / `COMMENT#<timestamp>#<commentId>` | Task comments in time order |
| `TASK#<taskId>` / `REVIEW#<reviewId>` | Review metadata lookup |
| `TAG#<tagName>` / `TASK#<taskId>` | Tag-based task lookup |
| `BOARD#<boardId>` / `ACTIVITY#<timestamp>#<activityId>` | Board activity and movement history |

## Query Patterns

- Fetch workspace metadata by querying `WORKSPACE#<workspaceId>`.
- Fetch boards in a workspace with `begins_with(SK, "BOARD#")`.
- Fetch lists in board order with `begins_with(SK, "LIST#")`, sorted by `position`.
- Fetch tasks in a board with `begins_with(SK, "TASK#")`, sorted by list and position.
- Fetch review metadata for a task with `begins_with(SK, "REVIEW#")`.
- Fetch task comments with `begins_with(SK, "COMMENT#")`.
- Fetch tasks by smart tag through `TAG#<tagName>`.
- Fetch board activity with `begins_with(SK, "ACTIVITY#")`.
