// Eligibility evaluator — versioned clauses, explainable output.
// Clause grammar: { id, label, field, op, value }
//   field: "cgpa" (float) | "activeBacklogs" (int, as written) | "skill:<id>" (text)
//   op:    ">=" | "<" | "=="
export type Clause = {
  id: string;
  label: string;
  field: string;
  op: string;
  value: number | string;
};

export type EligibilityProfile = {
  cgpaPercent: number;
  activeBacklogs: number;
  skills: Record<string, string>;
};

export type EligibilityResult = {
  passed: boolean;
  failedClauses: Clause[];
};

function cgpaToPercent(cgpa: string): number {
  const n = Number.parseFloat(cgpa);
  if (Number.isNaN(n)) return 0;
  // treat 0-10 scale CGPA as ×10 percentage points
  return n > 10 ? n : n * 10;
}

export function evaluateEligibility(
  version: number,
  clauses: Clause[],
  profile: EligibilityProfile,
): EligibilityResult {
  // version accepted for determinism/logging; identical semantics across versions here
  void version;
  const failed: Clause[] = [];
  for (const c of clauses) {
    if (c.field === "cgpa") {
      const v = profile.cgpaPercent;
      const ok = c.op === ">=" ? v >= Number(c.value) : c.op === "<" ? v < Number(c.value) : v === Number(c.value);
      if (!ok) failed.push(c);
    } else if (c.field === "activeBacklogs") {
      const v = profile.activeBacklogs;
      const ok = c.op === "==" ? v === Number(c.value) : c.op === "<" ? v < Number(c.value) : v >= Number(c.value);
      if (!ok) failed.push(c);
    } else if (c.field.startsWith("skill:")) {
      const skillId = c.field.slice(6);
      const state = profile.skills[skillId] ?? "none";
      const ok = String(state) === String(c.value);
      if (!ok) failed.push(c);
    }
  }
  return { passed: failed.length === 0, failedClauses: failed };
}

export { cgpaToPercent };
