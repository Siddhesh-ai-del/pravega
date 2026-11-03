import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AppShell } from "@/components/shell/app-shell";
import { VerifyClient } from "@/components/student/verify-client";

export default async function VerifyPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "student") redirect("/officer");

  return (
    <AppShell session={session}>
      <header className="border-b border-line px-4 md:px-8 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          Evidence-gated verification
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Verify Python from your work<span className="text-ledger">.</span>
        </h1>
        <p className="mt-1 text-[13px] text-muted max-w-[64ch]">
          Claims don&apos;t travel. Repos do. We read <b>language share, commit
          history, and test presence</b> — nothing else — and flip the state
          only if the evidence crosses the bar. Consent is read-only and can be
          revoked at any time.
        </p>
      </header>
      <VerifyClient name={session.name.split(" ")[0]} />
    </AppShell>
  );
}
