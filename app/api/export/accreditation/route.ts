// NAAC/NIRF-style CSV export of placement outcomes — the numbers in the
// report are the same rows shown on the heatmap, so nothing is collated by hand.
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "officer") {
    return new Response("Forbidden", { status: 403 });
  }
  const rows = await db
    .select()
    .from(schema.cohortSignals)
    .where(eq(schema.cohortSignals.tenantId, session.tenantId));

  const header = "Branch,Skill,Weak share %,Placement rate %,Measured at";
  const body = rows.map((r) =>
    [r.branch, r.skillId.toUpperCase(), r.weakShare, r.placementRate, new Date(r.measuredAt).toISOString().slice(0, 10)].join(","),
  );
  const csv = ["Pravega export — cohort outcomes (VPPCOE T&P)", header, ...body].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="naac-cohort-outcomes.csv"',
    },
  });
}
