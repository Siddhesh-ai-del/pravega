import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
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
        <div className="p-6 md:p-10">
          <p className="font-mono text-[9px] uppercase tracking-[0.32em] text-muted">Gap-closing path</p>
          <h1 className="mt-2 max-w-[20ch] text-[32px] font-semibold leading-[1.08] tracking-[-0.03em] text-ink md:text-[38px]">
            No active path yet.
          </h1>
          <p className="mt-2 max-w-[52ch] text-[13px] leading-snug text-muted">
            Complete a mock drive and the system will draft a gap-closing path from
            your evidence — every step inspectable, no hidden model calls.
          </p>
          <Link
            href="/student/mock-drive"
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-[6px] bg-probe px-5 text-[13px] font-medium text-paper transition-colors hover:bg-white"
          >
            Go to Mock Drive →
          </Link>
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
        name={session.name.split(" ")[0]}
      />
    </AppShell>
  );
}
