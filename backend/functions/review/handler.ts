import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import { db } from "../../shared/db/client";
import { createHandler } from "../../shared/utils/handler";

const TABLE_NAME = process.env.TABLE_NAME!;

export const handler = createHandler(async (event) => {
  const method = event.httpMethod;
  const body = JSON.parse(event.body || "{}");
  const taskId = event.pathParameters?.taskId || body.taskId;

  if (!taskId) {
    return { error: "Missing taskId" };
  }

  if (method === "POST") {
    const reviewId = randomUUID();
    const item = {
      PK: `TASK#${taskId}`,
      SK: `REVIEW#${reviewId}`,
      entityType: "ReviewMetadata",
      reviewId,
      taskId,
      reviewerId: body.reviewerId || "local-cognito-user",
      status: body.status || "needs-review",
      checklist: body.checklist || ["assignment fit", "team visibility", "goal alignment"],
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
        ":pk": `TASK#${taskId}`,
        ":sk": "REVIEW#",
      },
    })
  );

  return result.Items || [];
});
