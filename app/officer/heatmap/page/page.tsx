import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AppShell } from "@/components/shell/app-shell";
import { Stub } from "@/components/shell/stub";
export default async function Page() {
  const session = await getSession();
  if (!session) redirect("/login");
  return <AppShell session={session}><Stub title="Cohort Heatmap" detail="Branch × skill weakness across the batch — SQL 60% weak in CSE, Docker 90%." slice="pending" /></AppShell>;
}
