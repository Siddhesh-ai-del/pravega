import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { MockDriveClient } from "@/components/student/mock-drive-client";

export default async function MockDrivePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "student") redirect("/officer");

  const [run] = await db
    .select()
    .from(schema.mockDriveRuns)
    .where(eq(schema.mockDriveRuns.userId, session.userId))
    .orderBy(desc(schema.mockDriveRuns.createdAt))
    .limit(1);

  const [path] = await db
    .select()
    .from(schema.learningPaths)
    .where(eq(schema.learningPaths.userId, session.userId))
    .orderBy(desc(schema.learningPaths.createdAt))
    .limit(1);

  return (
    <AppShell session={session}>
      <MockDriveClient
        name={session.name.split(" ")[0]}
        targetRole={run?.targetRole ?? "Backend Developer"}
        run={run ? {
          id: run.id,
          totalScore: run.totalScore,
          totalMax: run.totalMax,
          rounds: run.rounds as Array<{ round: string; score: number; max: number; weakTopics: string[]; note: string }>,
        } : null}
        pathId={path?.id ?? null}
      />
    </AppShell>
  );
}
