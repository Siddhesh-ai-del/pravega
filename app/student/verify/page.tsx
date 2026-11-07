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
      <header className="construction-line" style={{ padding: "20px 24px" }}>
        <p className="case-number" style={{ color: "var(--muted-text)", marginBottom: "4px" }}>EVIDENCE-GATED VERIFICATION</p>
        <h1 className="display-md" style={{ marginBottom: "4px" }}>VERIFY PYTHON FROM YOUR WORK</h1>
        <p className="body-sm" style={{ color: "var(--muted-text)", maxWidth: "64ch" }}>
          Claims don&apos;t travel. Repos do. We read language share, commit history, and test presence —
          nothing else — and flip the state only if the evidence crosses the bar. Consent is read-only
          and revocable at any time.
        </p>
      </header>
      <VerifyClient name={session.name.split(" ")[0]} />
    </AppShell>
  );
}
