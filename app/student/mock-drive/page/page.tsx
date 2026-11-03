import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AppShell } from "@/components/shell/app-shell";
import { Stub } from "@/components/shell/stub";
export default async function Page() {
  const session = await getSession();
  if (!session) redirect("/login");
  return <AppShell session={session}><Stub title="Mock Drive" detail="Three rounds: aptitude, machine test, interview — with gap report." slice="pending" /></AppShell>;
}
