// Mastery levels for a 0–100 skill score, following Khan Academy's four learning states.
// Colors come from the --learn-* variables in design-refinements.css, keyed by `id`.
export type MasteryLevel = { id: "attempted" | "familiar" | "proficient" | "mastered"; label: string; zh: string };

const levels: (MasteryLevel & { min: number })[] = [
  { id: "mastered", label: "Mastered", zh: "已精通", min: 90 },
  { id: "proficient", label: "Proficient", zh: "熟练", min: 70 },
  { id: "familiar", label: "Familiar", zh: "熟悉", min: 40 },
  { id: "attempted", label: "Attempted", zh: "已尝试", min: 0 },
];

export function masteryLevel(score: number): MasteryLevel {
  const level = levels.find((candidate) => score >= candidate.min) ?? levels[levels.length - 1];
  return { id: level.id, label: level.label, zh: level.zh };
}
