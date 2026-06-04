import { generateDataset, writeJson } from "./lib/flowintel";

const dataset = generateDataset();
writeJson("seeded_records.json", dataset.records);

console.log(`Seeded workspaces: ${dataset.workspaces.length}`);
console.log(`Seeded boards: ${dataset.boards.length}`);
console.log(`Seeded lists: ${dataset.lists.length}`);
console.log(`Seeded tasks: ${dataset.tasks.length}`);
console.log(`Seeded comments: ${dataset.comments.length}`);
console.log(`Total seeded records: ${dataset.records.length}`);
