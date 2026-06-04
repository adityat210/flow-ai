import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import { db } from "../../shared/db/client";
import { createHandler } from "../../shared/utils/handler";

const TABLE_NAME = process.env.TABLE_NAME!;

export const handler = createHandler(async (event) => {
  const method = event.httpMethod;
  const body = JSON.parse(event.body || "{}");
  const boardId = event.pathParameters?.boardId || body.boardId;

  if (!boardId) {
    return { error: "Missing boardId" };
  }

  if (method === "POST") {
    const listId = body.listId || randomUUID();
    const item = {
      PK: `BOARD#${boardId}`,
      SK: `LIST#${listId}`,
      entityType: "List",
      listId,
      boardId,
      title: body.title || "Untitled List",
      position: body.position ?? 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
    return item;
  }

  const result = await db.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": `BOARD#${boardId}`,
        ":sk": "LIST#",
      },
    })
  );

  return (result.Items || []).sort((a, b) => (a.position || 0) - (b.position || 0));
});
