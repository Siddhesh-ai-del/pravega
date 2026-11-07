import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { LearningPathClient } from "@/components/student/learning-path-client";

type Task = { id: string; title: string; kind: string; producesEvidence: boolean; done: boolean };

export default async function LearningPathPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "student") redirect("/officer");

  const [path] = await db
    .select()
    .from(schema.learningPaths)
    .where(eq(schema.learningPaths.userId, session.userId))
    .orderBy(desc(schema.learningPaths.createdAt))
    .limit(1);

  if (!path) {
    return (
      <AppShell session={session}>
        <div style={{ padding: "40px", textAlign: "center" }}>
          <p className="body-md" style={{ color: "var(--muted-text)" }}>No active learning path. Complete a Mock Drive first.</p>
        </div>
      </AppShell>
    );
  }

  const reason = path.reason as { source?: string; machineNote?: string; jdSignal?: string };

  return (
    <AppShell session={session}>
      <LearningPathClient
        pathId={path.id}
        gapSkill="SQL"
        reason={reason}
        initialTasks={path.tasks as Task[]}
      />
    </AppShell>
  );
}
