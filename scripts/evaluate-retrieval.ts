import { evaluateCoverage, writeJson } from "./lib/flowintel";

const evaluation = evaluateCoverage();
writeJson("semantic_evaluation.json", evaluation);

console.log("Semantic vs Keyword Evaluation");
console.log(`keyword_baseline_matches: ${evaluation.keyword_baseline_matches}`);
console.log(`semantic_matches: ${evaluation.semantic_matches}`);
console.log(`improvement_multiplier: ${evaluation.improvement_multiplier}`);
