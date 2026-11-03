import "dotenv/config";
import { sql } from "drizzle-orm";
import { db, schema } from "./index";

const T = "vpcoe";
const day = (n: number) => new Date(Date.now() + n * 86_400_000);

async function main() {
  await db.execute(sql`TRUNCATE TABLE
    tenants, users, student_profiles, skills, student_skills, evidence,
    repo_analyses, eligibility_rules, eligibility_decisions, drives,
    mock_drive_runs, learning_paths, agent_runs, audit_log, cohort_signals,
    fairness_reports, mail_queue;`);

  await db.insert(schema.tenants).values({ id: T, name: "VPPCOE & VA — T&P Cell" });

  const users = [
    { id: "u-officer", role: "officer", name: "Anjali Deshmukh", email: "antp@vpcoe.edu", meta: { title: "Head — Training & Placement" } },
    { id: "u-student-rahul", role: "student", name: "Rahul Jadhav", email: "rahul.j@vpcoe.edu", meta: {} },
    { id: "u-student-sneha", role: "student", name: "Sneha Kulkarni", email: "sneha.k@vpcoe.edu", meta: {} },
    { id: "u-student-aman", role: "student", name: "Aman Shaikh", email: "aman.s@vpcoe.edu", meta: {} },
    { id: "u-student-priya", role: "student", name: "Priya Patil", email: "priya.p@vpcoe.edu", meta: {} },
    { id: "u-student-vikram", role: "student", name: "Vikram Rane", email: "vikram.r@vpcoe.edu", meta: {} },
    { id: "u-student-fatima", role: "student", name: "Fatima Saudagar", email: "fatima.s@vpcoe.edu", meta: {} },
    { id: "u-student-karan", role: "student", name: "Karan Bhosale", email: "karan.b@vpcoe.edu", meta: {} },
    { id: "u-recruiter", role: "recruiter", name: "Rohit Menon", email: "rohit@nimbustech.io", meta: { company: "Nimbus Tech" } },
  ];
  await db.insert(schema.users).values(users.map((u) => ({ ...u, tenantId: T })));

  await db.insert(schema.studentProfiles).values([
    { userId: "u-student-rahul", branch: "Computer Engineering", year: 4, cgpa: "8.1", activeBacklogs: 0, targetRole: "Backend Developer", consents: { github: true, leetcode: true, grantedAt: "2026-10-12T09:30:00Z" } },
    { userId: "u-student-sneha", branch: "IT Engineering", year: 4, cgpa: "8.6", activeBacklogs: 0, targetRole: "Data Analyst", consents: { github: true } },
    { userId: "u-student-aman", branch: "EnTC", year: 4, cgpa: "7.4", activeBacklogs: 0, targetRole: "QA Engineer", consents: {} },
    { userId: "u-student-priya", branch: "Computer Engineering", year: 4, cgpa: "8.9", activeBacklogs: 0, targetRole: "Backend Developer", consents: { github: true } },
    { userId: "u-student-vikram", branch: "IT Engineering", year: 4, cgpa: "6.2", activeBacklogs: 1, targetRole: "Support Engineer", consents: { github: false } },
    { userId: "u-student-fatima", branch: "EnTC", year: 4, cgpa: "7.9", activeBacklogs: 0, targetRole: "Embedded Trainee", consents: {} },
    { userId: "u-student-karan", branch: "Computer Engineering", year: 4, cgpa: "5.8", activeBacklogs: 2, targetRole: "Backend Developer", consents: { github: true } },
  ]);

  const skills = [
    { id: "py", name: "Python", taxonomy: "ESCO", demandShare: 68 },
    { id: "sql", name: "SQL", taxonomy: "ESCO", demandShare: 61 },
    { id: "react", name: "React", taxonomy: "ESCO", demandShare: 47 },
    { id: "docker", name: "Docker", taxonomy: "ESCO", demandShare: 40 },
    { id: "git", name: "Git", taxonomy: "ESCO", demandShare: 76 },
    { id: "node", name: "Node.js", taxonomy: "ESCO", demandShare: 33 },
  ];
  await db.insert(schema.skills).values(skills);

  await db.insert(schema.studentSkills).values([
    // Rahul — the demo lead. Python: CLAIMED (Act 1 flips it live)
    { tenantId: T, userId: "u-student-rahul", skillId: "py", state: "claimed", confidence: 20, claimedAt: day(-30) },
    { tenantId: T, userId: "u-student-rahul", skillId: "sql", state: "verified", confidence: 82, verifiedAt: day(-52), expiresAt: day(313) },
    { tenantId: T, userId: "u-student-rahul", skillId: "react", state: "verified", confidence: 74, verifiedAt: day(-90), expiresAt: day(275) },
    { tenantId: T, userId: "u-student-rahul", skillId: "git", state: "verified", confidence: 88, verifiedAt: day(-120), expiresAt: day(245) },
    { tenantId: T, userId: "u-student-rahul", skillId: "docker", state: "claimed", confidence: 15, claimedAt: day(-20) },
    // Sneha — data profile
    { tenantId: T, userId: "u-student-sneha", skillId: "sql", state: "verified", confidence: 90, verifiedAt: day(-40), expiresAt: day(325) },
    { tenantId: T, userId: "u-student-sneha", skillId: "py", state: "verified", confidence: 78, verifiedAt: day(-40), expiresAt: day(325) },
    // others minimal for heatmap/fairness seeds
    { tenantId: T, userId: "u-student-aman", skillId: "py", state: "claimed", confidence: 18, claimedAt: day(-10) },
    { tenantId: T, userId: "u-student-priya", skillId: "node", state: "verified", confidence: 80, verifiedAt: day(-60), expiresAt: day(305) },
    { tenantId: T, userId: "u-student-vikram", skillId: "git", state: "expired", confidence: 40, verifiedAt: day(-420), expiresAt: day(-55) },
    { tenantId: T, userId: "u-student-fatima", skillId: "py", state: "claimed", confidence: 12, claimedAt: day(-7) },
  ]);

  await db.insert(schema.evidence).values([
    // Rahul
    { id: "ev-r-sql-test", tenantId: T, userId: "u-student-rahul", skillId: "sql", kind: "test", title: "SQL Proficiency Test (T&P mock series)", refs: { score: "82/100", version: "tester-2025.11" }, createdAt: day(-52), validUntil: day(313) },
    { id: "ev-r-react-proj", tenantId: T, userId: "u-student-rahul", skillId: "react", kind: "github_repo", title: "campus-events-board (React)", uri: "https://github.com/rahuljadhav/campus-events-board", refs: { files: 31, commits: 64, languageShare: { JavaScript: 61, TypeScript: 33 } }, createdAt: day(-90), validUntil: day(275) },
    { id: "ev-r-git-attest", tenantId: T, userId: "u-student-rahul", skillId: "git", kind: "attestation", title: "Mentor attestation — Git workflow", uri: "https://github.com/rahuljadhav/campus-events-board", refs: { attestor: "Prof. S. Kulkarni", role: "Mentor" }, createdAt: day(-120), validUntil: day(245) },
    { id: "ev-r-cert-old", tenantId: T, userId: "u-student-rahul", skillId: "py", kind: "certificate", title: "Python Foundation (Coursera)", uri: null, refs: { issuer: "Coursera" }, createdAt: day(-400), validUntil: day(-35) }, // expired
    // Sneha
    { id: "ev-s-sql-test", tenantId: T, userId: "u-student-sneha", skillId: "sql", kind: "test", title: "SQL Proficiency Test (T&P mock series)", refs: { score: "90/100", version: "tester-2025.11" }, createdAt: day(-40), validUntil: day(325) },
    { id: "ev-s-py-repo", tenantId: T, userId: "u-student-sneha", skillId: "py", kind: "github_repo", title: "placement-analytics (Python)", uri: "https://github.com/snehak/placement-analytics", refs: { files: 22, commits: 41, languageShare: { Python: 88 } }, createdAt: day(-40), validUntil: day(325) },
  ]);

  await db.insert(schema.repoAnalyses).values([
    { id: "ra-01", userId: "u-student-sneha", skillId: "py", repoUri: "https://github.com/snehak/placement-analytics", findings: { pythonFiles: 18, realLogicFiles: 11, testsFound: 6, lastCommitDays: 14 }, verdict: "verified", mode: "fixtures", createdAt: day(-40) },
  ]);

  // ---- versioned eligibility rules
  await db.insert(schema.eligibilityRules).values([
    { id: "rule-nimbus-be", tenantId: T, name: "Nimbus Tech — Backend Dev", version: 3, active: true, clauses: [
      { id: "c1", label: "CGPA ≥ 60%", field: "cgpa", op: ">=", value: 60 },
      { id: "c2", label: "No active backlogs", field: "activeBacklogs", op: "==", value: 0 },
      { id: "c3", label: "SQL Verified", field: "skill:sql", op: "==", value: "verified" },
    ] },
  ]);

  await db.insert(schema.drives).values([
    { id: "drv-nimbus", tenantId: T, company: "Nimbus Tech", role: "Backend Developer", jdSkills: ["sql", "node", "docker", "git"], scheduledAt: day(21), status: "scheduled" },
    { id: "drv-zenfin", tenantId: T, company: "Zen Financial", role: "QA Engineer", jdSkills: ["sql", "git"], scheduledAt: day(10), status: "scheduled" },
    { id: "drv-nova", tenantId: T, company: "Nova Kits", role: "Frontend Trainee", jdSkills: ["react", "git"], status: "open" },
  ]);

  // Rahul retry seeded for Act 2 delta demo: earlier weak run on Aptitude+SQL
  await db.insert(schema.mockDriveRuns).values([
    { id: "mdr-r-1", userId: "u-student-rahul", targetRole: "Backend Developer", rounds: [
      { round: "aptitude", score: 21, max: 30, weakTopics: ["profit-loss", "clocks"], note: "Lost 6 marks on arithmetic word problems" },
      { round: "machine", score: 12, max: 20, weakTopics: ["sql"], note: "JOIN grouping incomplete; loops but no index use" },
      { round: "interview", score: 17, max: 30, weakTopics: ["database", "apis"], note: "Could not explain isolation levels; REST verbs vague" },
    ], totalScore: 50, totalMax: 80, createdAt: day(-35) },
  ]);

  await db.insert(schema.learningPaths).values([
    { id: "lp-r-sql-1", userId: "u-student-rahul", gapSkillId: "sql", reason: { source: "mock-drive mdr-r-1", machineNote: "JOIN grouping incomplete", jdSignal: "SQL in 61% of recent backend JDs" }, tasks: [
      { id: "t1", title: "SQL practice set A — joins & grouping (12 problems)", kind: "practice", producesEvidence: false, done: true },
      { id: "t2", title: "SQL practice set B — indexes & windowing (10 problems)", kind: "practice", producesEvidence: false, done: false },
      { id: "t3", title: "Mini-project: hostel-ledger API (uses JOINs + indexes, publish repo)", kind: "project", producesEvidence: true, done: false },
    ], createdAt: day(-34) },
  ]);

  await db.insert(schema.agentRuns).values([
    { id: "agr-1", tenantId: T, kind: "interview_questions", subject: "Nimbus Tech — Backend Dev interview set", detail: { draft: ["Walk through your hostel-ledger API: how would you page a 1M-row table?", "A report query now takes 8s — diagnose and fix.", "When would you skip Docker for a small service?"], rationale: "Generated from JD skills [sql, node, docker] + cohort weakness heatmap: SQL joins (41% weak)", confidence: 0.78 }, status: "pending", createdAt: day(-1) },
    { id: "agr-2", tenantId: T, kind: "eligibility_sweep", subject: "Nimbus Tech — eligibility sweep (7 students)", detail: { draft: { eligible: ["u-student-rahul", "u-student-sneha", "u-student-priya"], blocked: [
      { id: "u-student-vikram", clause: "c2", note: "1 active backlog (rule c2)" },
      { id: "u-student-karan", clause: "c1", note: "CGPA 58% < 60% + 2 backlogs" },
    ], ruleVersion: 3 }, confidence: 0.85 }, status: "pending", createdAt: day(-1) },
    { id: "agr-3", tenantId: T, kind: "schedule_draft", subject: "Nimbus Tech — 2 slots, Thu 14:00 / Fri 10:00", detail: { draft: { slots: ["Thu 2026-11-05 14:00", "Fri 2026-11-06 10:00"], clash: "Zen Financial uses Fri 10:00 — conflict", suggestion: "Move Nimbus to Fri 14:00" }, confidence: 0.9 }, status: "pending", createdAt: day(-1) },
  ]);

  await db.insert(schema.cohortSignals).values([
    { tenantId: T, branch: "Computer Engineering", skillId: "sql", weakShare: 60, placementRate: 71, measuredAt: day(-5) },
    { tenantId: T, branch: "Computer Engineering", skillId: "docker", weakShare: 90, placementRate: 71, measuredAt: day(-5) },
    { tenantId: T, branch: "Computer Engineering", skillId: "git", weakShare: 20, placementRate: 71, measuredAt: day(-5) },
    { tenantId: T, branch: "IT Engineering", skillId: "sql", weakShare: 35, placementRate: 78, measuredAt: day(-5) },
    { tenantId: T, branch: "IT Engineering", skillId: "docker", weakShare: 80, placementRate: 78, measuredAt: day(-5) },
    { tenantId: T, branch: "IT Engineering", skillId: "git", weakShare: 15, placementRate: 78, measuredAt: day(-5) },
    { tenantId: T, branch: "EnTC", skillId: "sql", weakShare: 72, placementRate: 64, measuredAt: day(-5) },
    { tenantId: T, branch: "EnTC", skillId: "docker", weakShare: 95, placementRate: 64, measuredAt: day(-5) },
    { tenantId: T, branch: "EnTC", skillId: "git", weakShare: 30, placementRate: 64, measuredAt: day(-5) },
  ]);

  await db.insert(schema.fairnessReports).values([
    { id: "fr-zen-1", tenantId: T, driveId: "drv-zenfin", segments: { gender: { F: { shortlistRate: 20, applicants: 5 }, M: { shortlistRate: 89, applicants: 9 } }, branch: { EnTC: { shortlistRate: 33, applicants: 6 }, CSE: { shortlistRate: 88, applicants: 8 } } }, findings: [{ segment: "gender", ratio: 0.22, benchmark: 0.8, flag: "F shortlist rate (20%) < 80% of M rate (89%) — human review required" }], createdAt: day(-4) },
  ]);

  await db.insert(schema.mailQueue).values([
    { tenantId: T, toEmail: "rohit@nimbustech.io", template: "drive-invitation", detail: { company: "Nimbus Tech", drive: "Backend Developer", date: "2026-11-06 14:00" }, status: "queued", createdAt: day(-1) },
  ]);

  console.log("Seeded vpcoe tenant:", users.length, "users");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
