import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AppShell } from "@/components/shell/app-shell";
import { Stub } from "@/components/shell/stub";
export default async function Page() {
  const session = await getSession();
  if (!session) redirect("/login");
  return <AppShell session={session}><Stub title="My Drives" detail="Scheduled drives + exact eligibility per rule version + appeal." slice="pending" /></AppShell>;
}
