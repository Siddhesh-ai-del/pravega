// Shared sample content for the design-lab variants.
// Same screen (T&P officer · Decision Queue) rendered by each direction so
// the comparison is honest. Not used by the product itself.

export const SAMPLE = {
  officer: {
    name: "Anjali Deshmukh",
    role: "T&P Officer",
    cell: "VPPCOE & VA — Training & Placement Cell",
    tenant: "vpcoe",
  },
  crumbs: ["Placement Cell", "Drives", "Nimbus Tech — Backend"],
  heading: "Decision Queue",
  subhead: "Agents propose. You dispose. Every decision writes to the audit trail.",
  pending: 3,
  dateLine: "Wednesday, 4 Nov 2026 · 09:40 IST",
  kpis: [
    { label: "Verified this week", value: "128", delta: "+12 vs last", up: true },
    { label: "Approvals pending", value: "3", delta: "oldest 2h 41m", up: null },
    { label: "Eligibility blocks", value: "2", delta: "rule v3 · be-track", up: null },
    { label: "Audit entries", value: "1,204", delta: "append-only", up: null },
  ],
  queue: [
    {
      id: "agr-1",
      kind: "INTERVIEW SET",
      conf: 92,
      caseNo: "PVG-2026-0114",
      title: "Nimbus Tech — Backend Dev interview set",
      why: "Generated from JD skills [sql · node · docker] + cohort weakness: SQL joins (41% weak)",
      lines: [
        "Walk me through your hostel-ledger API: how would you page a 1M-row table?",
        "A report query now takes 8s — diagnose and fix.",
        "When would you skip Docker for a small service?",
      ],
    },
    {
      id: "agr-2",
      kind: "ELIGIBILITY SWEEP",
      conf: 88,
      caseNo: "PVG-2026-0115",
      title: "Nimbus Tech — eligibility sweep",
      why: "3 eligible · rule v3 · be-track",
      blocked: [
        "u-student-vikram — 1 active backlog (rule c2)",
        "u-student-karan — CGPA 58% < 60% + 2 backlogs",
      ],
    },
    {
      id: "agr-3",
      kind: "SCHEDULE DRAFT",
      conf: 90,
      caseNo: "PVG-2026-0116",
      title: "Nimbus Tech — 2 slots, Thu 14:00 / Fri 10:00",
      why: "Hall B free both slots · panel availability confirmed",
      clash: "Zen Financial uses Fri 10:00 — conflict",
      suggestion: "Move Nimbus to Fri 14:00 — zero clashes, panel free",
    },
  ],
  // heat: 6 skills × 4 cohorts, intensity 0–4 (paper → ink)
  heatSkills: ["SQL joins", "Node APIs", "Docker", "System design", "Git workflow", "Testing"],
  heatCohorts: ["BE", "CE", "IT", "ME"],
  heat: [
    [3, 2, 4, 1],
    [1, 1, 2, 0],
    [2, 3, 2, 1],
    [4, 4, 3, 2],
    [0, 1, 1, 0],
    [2, 2, 3, 1],
  ],
  fairness: "Pass — no cohort skew across the 7 shortlisted candidates",
  fairnessDetail: "Selection rate parity 0.91 (BE↔CE↔IT) · χ² p=0.44",
  nav: [
    { label: "Decision Queue", href: "#", active: true },
    { label: "Cohort Heatmap", href: "#" },
    { label: "Eligibility Rules", href: "#" },
    { label: "Fairness Check", href: "#" },
    { label: "Audit Trail", href: "#" },
  ] as { href: string; label: string; active?: boolean }[],
} as const;

export type QueueItem = (typeof SAMPLE.queue)[number];
