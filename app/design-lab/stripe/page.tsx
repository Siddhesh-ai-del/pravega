import { Inter, IBM_Plex_Mono } from "next/font/google";
import { SAMPLE } from "@/lib/design-lab/data";

const inter = Inter({ subsets: ["latin"] });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"] });

export const metadata = { title: "Pravega — Executive SaaS (Direction 03)" };

const heatBg = ["#EEF0F7", "rgba(99,91,255,0.14)", "rgba(99,91,255,0.3)", "rgba(99,91,255,0.55)", "#635BFF"];

// tiny decorative sparklines (same shape for all KPIs — demo only)
const spark = ["M2 22 L14 18 L26 20 L38 12 L50 14 L62 8 L74 10", "M2 10 L14 12 L26 9 L38 14 L50 16 L62 18 L74 22", "M2 8 L14 10 L26 12 L38 12 L50 16 L62 19 L74 21", "M2 20 L14 17 L26 15 L38 15 L50 11 L62 9 L74 6"];

export default function ExecutiveSaasDemo() {
  const s = SAMPLE;
  return (
    <div className={`${inter.className} min-h-screen bg-[#F6F9FC] text-[#0A2540] flex`}>
      {/* signature gradient hairline */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-10 h-[3px]"
        style={{ background: "linear-gradient(90deg,#635BFF 0%,#00D4FF 45%,#FF5996 100%)" }}
      />

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="hidden md:flex w-[236px] shrink-0 flex-col border-r border-[#E3E8EE] bg-white">
        <div className="px-5 pt-6 pb-5 border-b border-[#E3E8EE]">
          <div className="flex items-center gap-2.5">
            <span
              className="grid h-8 w-8 place-items-center rounded-[8px]"
              style={{ background: "linear-gradient(135deg,#7A73FF 0%,#635BFF 55%,#4F46E5 100%)", boxShadow: "0 4px 12px rgba(99,91,255,0.4)" }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M2.4 7.4 5.4 10.2 11.6 3.6" stroke="white" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div>
              <p className="text-[17px] font-bold tracking-[-0.02em] text-[#0A2540] leading-none">
                Pravega
              </p>
              <p className={`${mono.className} mt-1 text-[8px] uppercase tracking-[0.18em] text-[#697386]`}>
                Verifying Ledger
              </p>
            </div>
          </div>
        </div>

        <nav aria-label="Main" className="px-3 py-4">
          <p className={`${mono.className} px-2 text-[9px] uppercase tracking-[0.22em] text-[#8898AA]`}>
            Placement ops
          </p>
          <ul className="mt-2 space-y-0.5">
            {s.nav.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  aria-current={item.active ? "page" : undefined}
                  className={`flex items-center justify-between rounded-md px-2.5 py-[7px] text-[13px] transition-colors ${
                    item.active
                      ? "bg-[#EFEEFF] font-semibold text-[#635BFF]"
                      : "text-[#3C4257] hover:bg-[#F6F9FC] hover:text-[#0A2540]"
                  }`}
                >
                  {item.label}
                  {item.active && (
                    <span className="rounded-full bg-[#635BFF] px-1.5 text-[10px] font-semibold text-white tabular-nums">3</span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto px-5 py-4 border-t border-[#E3E8EE]">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#0A2540] text-[11px] font-semibold text-white">
              AD
            </span>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-[#0A2540] leading-tight">Anjali Deshmukh</p>
              <p className={`${mono.className} mt-0.5 text-[8px] uppercase tracking-[0.16em] text-[#8898AA]`}>
                T&amp;P Officer · vpcoe
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Content ─────────────────────────────────────────── */}
      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between gap-4 px-5 py-3 md:px-8">
          <p className="text-[12px] text-[#697386]">
            Placement Cell <span className="text-[#C1C9D2]">/</span> Nimbus Tech{" "}
            <span className="text-[#C1C9D2]">/</span>{" "}
            <span className="font-semibold text-[#0A2540]">Decision Queue</span>
          </p>
          <div className="flex items-center gap-3">
            <p className="hidden md:block text-[11px] text-[#8898AA]">{s.dateLine}</p>
            <button className="rounded-md border border-[#E3E8EE] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#0A2540] shadow-sm transition-shadow hover:shadow">
              Export audit pack
            </button>
          </div>
        </header>

        <main className="px-5 pb-6 md:px-8">
          {/* title */}
          <div className="flex flex-wrap items-end justify-between gap-6 pt-2">
            <div>
              <h1 className="text-[30px] md:text-[34px] font-bold tracking-[-0.03em] leading-[1.1] text-[#0A2540]">
                Decision Queue
              </h1>
              <p className="mt-1.5 max-w-[52ch] text-[13px] leading-snug text-[#697386]">
                Agents propose. You dispose. Every decision is written to the audit ledger and
                carries NAAC / NIRF-ready evidence.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-[#E3E8EE] bg-white px-4 py-2.5 shadow-[0_1px_1px_rgba(0,0,0,0.03),0_4px_12px_rgba(50,50,93,0.07)]">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#FFF4E5] text-[16px]" aria-hidden>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6.2" stroke="#B54708" strokeWidth="1.5" />
                  <path d="M8 5v3.4l2.2 1.4" stroke="#B54708" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <div>
                <p className="text-[11px] font-semibold text-[#0A2540] leading-tight">3 awaiting you</p>
                <p className="text-[10px] text-[#8898AA]">oldest pending 2h 41m</p>
              </div>
            </div>
          </div>

          {/* KPI cards */}
          <dl className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {s.kpis.map((k, i) => (
              <div
                key={k.label}
                className="rounded-xl border border-[#E3E8EE] bg-white p-3.5 shadow-[0_1px_1px_rgba(0,0,0,0.03),0_6px_16px_rgba(50,50,93,0.07)]"
              >
                <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8898AA]">
                  {k.label}
                </dt>
                <div className="mt-1.5 flex items-end justify-between gap-2">
                  <dd className="text-[26px] leading-none font-bold tracking-[-0.02em] text-[#0A2540] tabular-nums">
                    {k.value}
                  </dd>
                  <svg width="52" height="22" viewBox="0 0 76 24" fill="none" aria-hidden className="shrink-0">
                    <path d={spark[i]} stroke={k.up === true ? "#00A86B" : "#635BFF"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <dd className={`mt-1 text-[10px] font-medium ${k.up === true ? "text-[#00A86B]" : "text-[#8898AA]"}`}>
                  {k.delta}
                </dd>
              </div>
            ))}
          </dl>

          {/* main grid */}
          <div className="mt-4 grid gap-4 xl:grid-cols-12">
            {/* queue */}
            <section aria-label="Proposals" className="xl:col-span-8 space-y-3">
              {/* Card 1 */}
              <article className="overflow-hidden rounded-xl border border-[#E3E8EE] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.03),0_8px_24px_rgba(50,50,93,0.08)]">
                <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#635BFF,#00D4FF)" }} />
                <div className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2">
                      <span className="rounded-md bg-[#EFEEFF] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#635BFF]">
                        Interview set
                      </span>
                      <span className={`${mono.className} text-[9px] text-[#8898AA]`}>pvg-2026-0114 · agr-1</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#0A2540]">
                      <span className="relative h-1.5 w-24 overflow-hidden rounded-full bg-[#EDF1F7]">
                        <span className="absolute inset-y-0 left-0 w-[92%] rounded-full bg-gradient-to-r from-[#635BFF] to-[#00D4FF]" />
                      </span>
                      92% match
                    </span>
                  </div>
                  <h2 className="mt-2.5 text-[17px] font-bold tracking-[-0.015em] text-[#0A2540]">
                    Nimbus Tech — Backend Dev interview set
                  </h2>
                  <p className="mt-0.5 text-[11px] text-[#697386]">
                    <span className="font-semibold text-[#635BFF]">Why</span> — JD skills [sql · node · docker] + cohort weakness: SQL joins 41% weak
                  </p>
                  <ol className="mt-2.5 divide-y divide-[#EDF1F7] rounded-lg border border-[#EDF1F7] bg-[#FDFDFE]">
                    {s.queue[0].lines?.map((q, i) => (
                      <li key={i} className="flex items-baseline gap-2.5 px-3 py-2 text-[11px] leading-snug text-[#3C4257]">
                        <span className="font-mono text-[9px] font-semibold text-[#635BFF]">Q{i + 1}</span>
                        {q}
                      </li>
                    ))}
                  </ol>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      className="rounded-md bg-[#635BFF] px-4 py-2 text-[12px] font-semibold text-white transition-all hover:bg-[#5851EA]"
                      style={{ boxShadow: "0 1px 2px rgba(99,91,255,0.4), inset 0 1px 0 rgba(255,255,255,0.25)" }}
                    >
                      Approve &amp; seal
                    </button>
                    <button className="rounded-md border border-[#E3E8EE] bg-white px-4 py-2 text-[12px] font-semibold text-[#0A2540] shadow-sm hover:border-[#C1C9D2]">
                      Override with reason…
                    </button>
                    <button className="px-3 py-2 text-[12px] font-medium text-[#697386] hover:text-[#0A2540]">
                      Defer
                    </button>
                  </div>
                </div>
              </article>

              {/* Card 2 */}
              <article className="rounded-xl border border-[#E3E8EE] bg-white p-4 shadow-[0_1px_1px_rgba(0,0,0,0.03),0_6px_16px_rgba(50,50,93,0.06)]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2">
                    <span className="rounded-md bg-[#EFEEFF] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#635BFF]">
                      Eligibility sweep
                    </span>
                    <span className={`${mono.className} text-[9px] text-[#8898AA]`}>pvg-2026-0115 · agr-2</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#0A2540]">
                    <span className="relative h-1.5 w-24 overflow-hidden rounded-full bg-[#EDF1F7]">
                      <span className="absolute inset-y-0 left-0 w-[88%] rounded-full bg-gradient-to-r from-[#635BFF] to-[#00D4FF]" />
                    </span>
                    88%
                  </span>
                </div>
                <h3 className="mt-2 text-[15px] font-bold tracking-[-0.01em] text-[#0A2540]">
                  Nimbus Tech — eligibility sweep <span className="font-medium text-[#697386]">· 7 students</span>
                </h3>
                <p className="mt-0.5 text-[11px] text-[#697386]">
                  <span className="font-semibold text-[#00A86B]">3 eligible</span> · rule v3 · be-track
                </p>
                <ul className="mt-1.5 space-y-1">
                  {s.queue[1].blocked?.map((b) => (
                    <li key={b} className="flex items-baseline gap-2 text-[10px] text-[#B42318]">
                      <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-[#DF1B41]" />
                      <span className={mono.className}>{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button className="rounded-md bg-[#635BFF] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#5851EA]" style={{ boxShadow: "0 1px 2px rgba(99,91,255,0.4)" }}>
                    Approve &amp; seal
                  </button>
                  <button className="rounded-md border border-[#E3E8EE] bg-white px-4 py-2 text-[12px] font-semibold text-[#0A2540] shadow-sm hover:border-[#C1C9D2]">
                    Override with reason…
                  </button>
                  <button className="px-3 py-2 text-[12px] font-medium text-[#697386] hover:text-[#0A2540]">Defer</button>
                </div>
              </article>

              {/* Card 3 */}
              <article className="rounded-xl border border-[#E3E8EE] bg-white p-4 shadow-[0_1px_1px_rgba(0,0,0,0.03),0_6px_16px_rgba(50,50,93,0.06)]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2">
                    <span className="rounded-md bg-[#EFEEFF] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#635BFF]">
                      Schedule draft
                    </span>
                    <span className={`${mono.className} text-[9px] text-[#8898AA]`}>pvg-2026-0116 · agr-3</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#0A2540]">
                    <span className="relative h-1.5 w-24 overflow-hidden rounded-full bg-[#EDF1F7]">
                      <span className="absolute inset-y-0 left-0 w-[90%] rounded-full bg-gradient-to-r from-[#635BFF] to-[#00D4FF]" />
                    </span>
                    90%
                  </span>
                </div>
                <h3 className="mt-2 text-[15px] font-bold tracking-[-0.01em] text-[#0A2540]">
                  Nimbus Tech — 2 slots <span className="font-medium text-[#697386]">· Thu 14:00 / Fri 10:00</span>
                </h3>
                <div className="mt-1.5 flex items-center gap-2 rounded-md border border-[#FEE9C2] bg-[#FFFBEB] px-3 py-1.5 text-[10px] font-medium text-[#B54708]">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                    <path d="M6 1.2 11 10H1L6 1.2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                    <path d="M6 4.6v2.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    <circle cx="6" cy="8.6" r="0.4" fill="currentColor" />
                  </svg>
                  Clash — Zen Financial uses Fri 10:00
                </div>
                <p className="mt-1.5 text-[10px] font-medium text-[#00875A]">
                  <span className="text-[#00A86B]">Fix</span> — move Nimbus to Fri 14:00 · zero clashes, panel free
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button className="rounded-md bg-[#635BFF] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#5851EA]" style={{ boxShadow: "0 1px 2px rgba(99,91,255,0.4)" }}>
                    Approve &amp; seal
                  </button>
                  <button className="rounded-md border border-[#E3E8EE] bg-white px-4 py-2 text-[12px] font-semibold text-[#0A2540] shadow-sm hover:border-[#C1C9D2]">
                    Override with reason…
                  </button>
                  <button className="px-3 py-2 text-[12px] font-medium text-[#697386] hover:text-[#0A2540]">Defer</button>
                </div>
              </article>
            </section>

            {/* right rail */}
            <section aria-label="Evidence and fairness" className="xl:col-span-4 space-y-3">
              <div className="rounded-xl border border-[#E3E8EE] bg-white p-4 shadow-[0_1px_1px_rgba(0,0,0,0.03),0_6px_16px_rgba(50,50,93,0.06)]">
                <div className="flex items-baseline justify-between">
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#697386]">
                    Cohort heat · mock #4
                  </h2>
                  <span className={`${mono.className} text-[8px] text-[#8898AA]`}>fig. 1</span>
                </div>
                <div className="mt-2.5 overflow-x-auto">
                  <table className="w-full border-collapse text-center">
                    <thead>
                      <tr>
                        <th />
                        {s.heatCohorts.map((c) => (
                          <th key={c} className="pb-1 text-[9px] font-bold text-[#8898AA]">{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {s.heatSkills.map((skill, i) => (
                        <tr key={skill}>
                          <th className="py-[2px] pr-2 text-left text-[10px] font-medium text-[#3C4257]">
                            {skill}
                          </th>
                          {s.heat[i].map((v, j) => (
                            <td key={j} className="p-[2px]">
                              <span
                                className={`grid h-6 w-full min-w-8 place-items-center rounded-[5px] text-[8px] font-semibold ${v >= 3 ? "text-white" : "text-[#635BFF]"}`}
                                style={{ background: heatBg[v] }}
                              >
                                {["·", "25", "50", "75", "95"][v]}
                              </span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-2 border-t border-[#EDF1F7] pt-2 text-[10px] leading-snug text-[#697386]">
                  <span className="font-semibold text-[#0A2540]">SQL joins — 41% weak</span> across BE &amp; CE;
                  agr-1 weighted the issued set toward joins.
                </p>
              </div>

              <div className="rounded-xl border border-[#D3F4E4] bg-[#F0FDF6] p-4">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[#00A86B] text-white">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                      <path d="M2 6.3 4.8 9 10 3" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-[12px] font-bold text-[#00875A]">Fairness check passed</p>
                    <p className="text-[9px] font-medium text-[#00A86B]">parity 0.91 · χ² p = 0.44</p>
                  </div>
                </div>
                <p className="mt-2 text-[10px] leading-snug text-[#046C4E]">
                  No cohort skew across the 7 shortlisted candidates. Overrides require a written
                  reason and surface in the weekly audit review.
                </p>
              </div>

              <div className="rounded-xl border border-[#E3E8EE] bg-white p-4 shadow-[0_1px_1px_rgba(0,0,0,0.03)]">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8898AA]">
                  Why you can trust this screen
                </h2>
                <ul className="mt-2 space-y-1.5 text-[10px] leading-snug text-[#3C4257]">
                  <li className="flex gap-1.5"><span className="text-[#635BFF]">1.</span> Every action appends to a SHA-chained, append-only ledger.</li>
                  <li className="flex gap-1.5"><span className="text-[#635BFF]">2.</span> Overrides need a reason (min 8 chars) — no silent edits.</li>
                  <li className="flex gap-1.5"><span className="text-[#635BFF]">3.</span> Exports embed the NAAC / NIRF verification seal.</li>
                </ul>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
