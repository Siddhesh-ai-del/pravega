import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  serial,
  index,
} from "drizzle-orm/pg-core";

// ---- tenancy: one row per college; every table carries tenantId ----------

export const tenants = pgTable("tenants", {
  id: text("id").primaryKey(), // e.g. "vpcoe"
  name: text("name").notNull(),
});

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    role: text("role").notNull(), // student | officer | admin | recruiter
    name: text("name").notNull(),
    email: text("email").notNull(),
    meta: jsonb("meta").default({}).notNull(),
  },
  (t) => [index("users_tenant_role_idx").on(t.tenantId, t.role)],
);

export const studentProfiles = pgTable("student_profiles", {
  userId: text("user_id").primaryKey(),
  branch: text("branch").notNull(),
  year: integer("year").notNull(),
  cgpa: text("cgpa").notNull(),
  activeBacklogs: integer("active_backlogs").notNull().default(0),
  targetRole: text("target_role").notNull(),
  consents: jsonb("consents").default({}).notNull(),
});

export const skills = pgTable("skills", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  taxonomy: text("taxonomy").notNull().default("ESCO"),
  // demandSide: share of recent JDs asking for it (for gap profiler)
  demandShare: integer("demand_share").notNull().default(0),
});

// ---- evidence-gated skill states -----------------------------------------
// state: claimed | verified | expired (observed folded into evidence presence)

export const studentSkills = pgTable(
  "student_skills",
  {
    id: serial("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    userId: text("user_id").notNull(),
    skillId: text("skill_id").notNull(),
    state: text("state").notNull().default("claimed"), // claimed|verified|expired
    confidence: integer("confidence").notNull().default(0), // 0-100
    claimedAt: timestamp("claimed_at", { withTimezone: true }).notNull().defaultNow(),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
  },
  (t) => [index("student_skills_user_idx").on(t.userId)],
);

export const evidence = pgTable(
  "evidence",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    userId: text("user_id").notNull(),
    skillId: text("skill_id"),
    kind: text("kind").notNull(), // github_repo | test | certificate | project | attestation | practice
    title: text("title").notNull(),
    uri: text("uri"),
    refs: jsonb("refs").default({}).notNull(), // commits, scores, attestor, etc.
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    validUntil: timestamp("valid_until", { withTimezone: true }),
  },
  (t) => [index("evidence_user_idx").on(t.userId, t.skillId)],
);

export const repoAnalyses = pgTable("repo_analyses", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  skillId: text("skill_id").notNull(),
  repoUri: text("repo_uri").notNull(),
  findings: jsonb("findings").default({}).notNull(), // files, commits, langs, tests
  verdict: text("verdict").notNull(), // verified | insufficient
  mode: text("mode").notNull().default("live"), // live | fixtures
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---- versioned eligibility rules + decisions ------------------------------

export const eligibilityRules = pgTable("eligibility_rules", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  name: text("name").notNull(),
  version: integer("version").notNull().default(1),
  // clauses: [{id,label,field,op,value}]
  clauses: jsonb("clauses").default([]).notNull(),
  active: boolean("active").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const eligibilityDecisions = pgTable("eligibility_decisions", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  studentId: text("student_id").notNull(),
  ruleId: text("rule_id").notNull(),
  ruleVersion: integer("rule_version").notNull(),
  passed: boolean("passed").notNull(),
  failedClauses: jsonb("failed_clauses").default([]).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---- drives + mock drive ---------------------------------------------------

export const drives = pgTable("drives", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  company: text("company").notNull(),
  role: text("role").notNull(),
  jdSkills: jsonb("jd_skills").default([]).notNull(),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  status: text("status").notNull().default("open"), // open | scheduled | closed
});

export const mockDriveRuns = pgTable("mock_drive_runs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  targetRole: text("target_role").notNull(),
  rounds: jsonb("rounds").default([]).notNull(),
  // [{round:'aptitude'|'machine'|'interview', score, max, weakTopics:[], note}]
  totalScore: integer("total_score").notNull().default(0),
  totalMax: integer("total_max").notNull().default(80),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const learningPaths = pgTable("learning_paths", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  gapSkillId: text("gap_skill_id").notNull(),
  reason: jsonb("reason").default({}).notNull(), // explainable inputs
  tasks: jsonb("tasks").default([]).notNull(),
  // [{id,title,kind,producesEvidence,done}]
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---- agent actions with human gate -----------------------------------------

export const agentRuns = pgTable("agent_runs", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  kind: text("kind").notNull(), // eligibility_sweep | interview_questions | schedule_draft | forecast
  subject: text("subject").notNull(), // human-readable label
  detail: jsonb("detail").default({}).notNull(), // draft output + reason codes
  status: text("status").notNull().default("pending"), // pending|approved|overridden|deferred
  decidedBy: text("decided_by"),
  decidedReason: text("decided_reason"),
  decidedAt: timestamp("decided_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---- append-only audit ------------------------------------------------------

export const auditLog = pgTable(
  "audit_log",
  {
    id: serial("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    actorId: text("actor_id").notNull(),
    action: text("action").notNull(),
    targetType: text("target_type").notNull(),
    targetId: text("target_id").notNull(),
    detail: jsonb("detail").default({}).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("audit_created_idx").on(t.createdAt)],
);

export const cohortSignals = pgTable("cohort_signals", {
  id: serial("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  branch: text("branch").notNull(),
  skillId: text("skill_id").notNull(),
  weakShare: integer("weak_share").notNull(), // % of batch weak, for heatmap
  placementRate: integer("placement_rate").notNull(), // %
  measuredAt: timestamp("measured_at", { withTimezone: true }).notNull().defaultNow(),
});

export const fairnessReports = pgTable("fairness_reports", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  driveId: text("drive_id").notNull(),
  segments: jsonb("segments").default({}).notNull(), // {gender:{hiredRate...}}
  findings: jsonb("findings").default([]).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const mailQueue = pgTable("mail_queue", {
  id: serial("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  toEmail: text("to_email").notNull(),
  template: text("template").notNull(),
  detail: jsonb("detail").default({}).notNull(),
  status: text("status").notNull().default("queued"), // queued|sent
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
