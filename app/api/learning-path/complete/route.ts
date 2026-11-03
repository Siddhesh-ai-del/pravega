import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { recordAudit } from "@/lib/audit";
import { randomUUID } from "node:crypto";

type Task = { id: string; title: string; kind: string; producesEvidence: boolean; done: boolean };

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return Response.json({ error: "Sign in as a student" }, { status: 401 });
  }
  const { pathId, taskId } = (await request.json().catch(() => ({}))) as {
    pathId?: string;
    taskId?: string;
  };
  if (!pathId || !taskId) return Response.json({ error: "pathId and taskId required" }, { status: 400 });

  const [path] = await db
    .select()
    .from(schema.learningPaths)
    .where(eq(schema.learningPaths.id, pathId));

  if (!path || path.userId !== session.userId) {
    return Response.json({ error: "Path not found" }, { status: 404 });
  }

  const tasks = path.tasks as Task[];
  const idx = tasks.findIndex((t) => t.id === taskId);
  if (idx === -1) return Response.json({ error: "Task not found" }, { status: 404 });

  const wasDone = tasks[idx].done;
  const updated = tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t));

  await db
    .update(schema.learningPaths)
    .set({ tasks: updated })
    .where(eq(schema.learningPaths.id, pathId));

  let evidenceCreated = false;
  if (!wasDone && tasks[idx].producesEvidence) {
    const evId = `ev-${randomUUID().slice(0, 8)}`;
    await db.insert(schema.evidence).values({
      id: evId,
      tenantId: session.tenantId,
      userId: session.userId,
      skillId: path.gapSkillId,
      kind: "project",
      title: "hostel-ledger API — gap-closing artifact (JOIN grouping + indexes)",
      uri: "replay://classroom/hostel-ledger",
      refs: { producedBy: "learning-path", task: "t3" },
      createdAt: new Date(),
      validUntil: new Date(Date.now() + 365 * 86_400_000),
    });
    await recordAudit({
      tenantId: session.tenantId,
      actorId: session.userId,
      action: "evidence.created",
      targetType: "evidence",
      targetId: evId,
      detail: { via: "learning-path", path: pathId, task: taskId },
    });
    evidenceCreated = true;
  } else {
    await recordAudit({
      tenantId: session.tenantId,
      actorId: session.userId,
      action: updated[idx].done ? "path.task_done" : "path.task_undone",
      targetType: "learning_path",
      targetId: pathId,
      detail: { task: taskId },
    });
  }

  return Response.json({ ok: true, tasks: updated, evidenceCreated });
}
