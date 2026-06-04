import { writeAllOutputs } from "./lib/flowintel";

const { metrics, latency } = writeAllOutputs();

console.log("FlowIntel Metrics");
console.log(JSON.stringify(metrics, null, 2));
console.log("Latency Report");
console.log(JSON.stringify(latency, null, 2));
