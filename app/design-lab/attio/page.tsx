import { Inter, Instrument_Serif } from "next/font/google";
import { SAMPLE } from "@/lib/design-lab/data";

const inter = Inter({ subsets: ["latin"] });
const serif = Instrument_Serif({ subsets: ["latin"], weight: ["400"], style: ["normal", "italic"] });

export const metadata = { title: "Pravega — AI-Native Soft (Direction 04)" };

const heatBg = ["#F1EFE9", "#E7E3FF", "#CFC8FF", "#A79DF5", "#16150F"];

function Spark({ className }: { className?: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden className={className}>
      <path
        d="M6 0.8 7.5 4.3 11.2 6 7.5 7.7 6 11.2 4.5 7.7 0.8 6 4.5 4.3 6 0.8Z"
        fill="url(#sparkg)"
      />
      <defs>
        <linearGradient id="sparkg" x1="0" y1="0" x2="12" y2="12">
          <stop stopColor="#B8A6FF" />
          <stop offset="1" stopColor="#FF9E7A" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function AiNativeSoftDemo() {
  const s = SAMPLE;
  return (
    <div className={`${inter.className} relative min-h-screen overflow-hidden bg-[#FAFAF8] text-[#16150F] flex`}>
      {/* mesh gradient backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(52rem 34rem at 85% -10%, rgba(255,158,122,0.28), transparent 60%)," +
            "radial-gradient(46rem 32rem at -20% 30%, rgba(184,166,255,0.30), transparent 60%)," +
            "radial-gradient(40rem 30rem at 55% 115%, rgba(167,243,208,0.35), transparent 60%)",
        }}
      />

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="relative hidden md:flex w-[240px] shrink-0 flex-col px-4 pt-7 pb-5">
        <a href="#" className="px-2">
          <p className={`${serif.className} text-[32px] leading-none text-[#16150F]`}>
            Pravega<span className="italic text-[#B8A6FF]">*</span>
          </p>
          <p className="mt-1.5 text-[9px] font-medium uppercase tracking-[0.22em] text-[#8B887C]">
            The verifying ledger
          </p>
        </a>

        <nav aria-label="Main" className="mt-8">
          <p className="px-3 text-[9px] font-semibold uppercase tracking-[0.24em] text-[#A8A698]">
            Workspace
          </p>
          <ul className="mt-2 flex flex-col items-start gap-1">
            {s.nav.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  aria-current={item.active ? "page" : undefined}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] transition-all ${
                    item.active
                      ? "bg-[#16150F] font-medium text-[#FAFAF8] shadow-[0_8px_24px_rgba(22,21,15,0.25)]"
                      : "text-[#6F6C60] hover:bg-white/70 hover:text-[#16150F]"
                  }`}
                >
                  {item.label}
                  {item.active && <Spark className="opacity-90" />}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto rounded-2xl border border-[#ECEAE4] bg-white/70 p-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#16150F] text-[12px] font-semibold text-[#FAFAF8]">
              AD
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold leading-tight">Anjali Deshmukh</p>
              <p className="text-[10px] text-[#8B887C]">T&amp;P Officer · signatory</p>
            </div>
          </div>
          <p className="mt-3 text-[9px] leading-relaxed text-[#A8A698]">
            Every signature appends to the ledger. No silent edits — ever.
          </p>
        </div>
      </aside>

      {/* ── Content ─────────────────────────────────────────── */}
      <div className="relative min-w-0 flex-1">
        <header className="flex items-center justify-between gap-4 px-5 py-4 md:px-8">
          <p className="text-[11px] font-medium text-[#8B887C]">
            Placement Cell <span className="text-[#D8D5CB]">→</span> Nimbus Tech{" "}
            <span className="text-[#D8D5CB]">→</span>{" "}
            <span className="text-[#16150F]">Decision Queue</span>
          </p>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-2 rounded-full border border-[#ECEAE4] bg-white/70 px-3 py-1.5 text-[10px] font-medium text-[#6F6C60] backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-[#34D399]" />
              Agents live · fixtures mode
            </span>
            <button className="rounded-full bg-[#16150F] px-4 py-2 text-[11px] font-medium text-[#FAFAF8] transition-transform hover:scale-[1.02]">
              Export pack
            </button>
          </div>
        </header>

        <main className="px-5 pb-6 md:px-8">
          {/* title */}
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-[58ch]">
              <h1 className="text-[38px] md:text-[46px] leading-[1.02] tracking-[-0.02em] text-[#16150F]">
                <span className={`${serif.className} font-normal`}>Three calls</span>
                <span className={`${serif.className} font-normal italic text-[#8B887C]`}> for you</span>
                <br />
                <span className={`${serif.className} font-normal`}>to make.</span>
              </h1>
              <p className="mt-2 text-[13px] leading-snug text-[#6F6C60]">
                Your agents drafted the interview set, swept eligibility and resolved the schedule
                clash. Nothing reaches a student without your seal.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {s.kpis.slice(0, 2).map((k) => (
                <div key={k.label} className="rounded-2xl border border-[#ECEAE4] bg-white/70 px-4 py-3 backdrop-blur-md">
                  <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#A8A698]">{k.label}</p>
                  <p className={`${serif.className} mt-1 text-[30px] leading-none text-[#16150F] tabular-nums`}>{k.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* main grid */}
          <div className="mt-5 grid gap-4 xl:grid-cols-12">
            {/* queue */}
            <section aria-label="Proposals" className="xl:col-span-8 space-y-4">
              {/* Card 1 */}
              <article className="rounded-[22px] border border-[#ECEAE4] bg-white/80 p-5 backdrop-blur-xl shadow-[0_1px_2px_rgba(22,21,15,0.05),0_24px_48px_-24px_rgba(22,21,15,0.25)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F1EDFF] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#5B4FD6]">
                      <Spark /> Interview set
                    </span>
                    <span className="text-[9px] text-[#A8A698]">case 0114 · agent agr-1</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#16150F] px-3 py-1.5 text-[9px] font-semibold text-[#FAFAF8]">
                    92% sure
                  </span>
                </div>
                <h2 className={`${serif.className} mt-3 text-[26px] leading-[1.12] text-[#16150F]`}>
                  Nimbus Tech — Backend Dev interview set
                </h2>
                <p className="mt-1.5 text-[11px] leading-snug text-[#6F6C60]">
                  <span className="font-semibold text-[#16150F]">Why</span> · JD skills [sql, node, docker] —
                  cohort weakness: SQL joins (41%).
                </p>
                <ol className="mt-3 space-y-1.5">
                  {s.queue[0].lines?.map((q, i) => (
                    <li
                      key={i}
                      className="flex items-baseline gap-3 rounded-xl bg-[#FAFAF8] px-4 py-2.5 text-[12px] leading-snug text-[#3A3831]"
                    >
                      <span className={`${serif.className} italic text-[15px] text-[#B8A6FF]`}>{i + 1}.</span>
                      {q}
                    </li>
                  ))}
                </ol>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button className="rounded-full bg-[#16150F] px-6 py-2.5 text-[12px] font-semibold text-[#FAFAF8] transition-transform hover:scale-[1.02]">
                    Approve — seal it
                  </button>
                  <button className="rounded-full border border-[#16150F]/15 bg-white px-5 py-2.5 text-[12px] font-semibold text-[#16150F] hover:border-[#16150F]">
                    Override…
                  </button>
                  <button className="rounded-full px-4 py-2.5 text-[12px] font-medium text-[#8B887C] hover:text-[#16150F]">
                    Defer
                  </button>
                </div>
              </article>

              {/* Card 2 */}
              <article className="rounded-[22px] border border-[#ECEAE4] bg-white/80 p-5 backdrop-blur-xl shadow-[0_1px_2px_rgba(22,21,15,0.05),0_18px_40px_-22px_rgba(22,21,15,0.22)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E9FBF0] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#0F7A4A]">
                      <Spark /> Eligibility sweep
                    </span>
                    <span className="text-[9px] text-[#A8A698]">case 0115 · agr-2</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F1EDFF] px-3 py-1.5 text-[9px] font-semibold text-[#5B4FD6]">
                    88% sure
                  </span>
                </div>
                <h3 className={`${serif.className} mt-3 text-[21px] leading-snug text-[#16150F]`}>
                  Eligibility sweep — 7 students, <span className="italic text-[#0F7A4A]">3 clear to proceed</span>
                </h3>
                <ul className="mt-2 space-y-1.5">
                  {s.queue[1].blocked?.map((b) => (
                    <li key={b} className="flex items-baseline gap-2 rounded-xl bg-[#FDF3F3] px-4 py-2 text-[10px] text-[#9B1C1C]">
                      <span aria-hidden className="font-bold">×</span>
                      <span className="font-mono">{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button className="rounded-full bg-[#16150F] px-6 py-2.5 text-[12px] font-semibold text-[#FAFAF8] hover:scale-[1.02]">
                    Approve — seal it
                  </button>
                  <button className="rounded-full border border-[#16150F]/15 bg-white px-5 py-2.5 text-[12px] font-semibold text-[#16150F] hover:border-[#16150F]">
                    Override…
                  </button>
                  <button className="rounded-full px-4 py-2.5 text-[12px] font-medium text-[#8B887C] hover:text-[#16150F]">Defer</button>
                </div>
              </article>

              {/* Card 3 */}
              <article className="rounded-[22px] border border-[#ECEAE4] bg-white/80 p-5 backdrop-blur-xl shadow-[0_1px_2px_rgba(22,21,15,0.05),0_18px_40px_-22px_rgba(22,21,15,0.22)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF4E5] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#B45309]">
                      <Spark /> Schedule draft
                    </span>
                    <span className="text-[9px] text-[#A8A698]">case 0116 · agr-3</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF4E5] px-3 py-1.5 text-[9px] font-semibold text-[#B45309]">
                    clash detected
                  </span>
                </div>
                <h3 className={`${serif.className} mt-3 text-[21px] leading-snug text-[#16150F]`}>
                  Two slots — Thu 14:00 <span className="italic text-[#A8A698]">or</span> Fri 10:00
                </h3>
                <p className="mt-1.5 text-[11px] leading-snug text-[#6F6C60]">
                  <span className="font-semibold text-[#B45309]">Friday collides</span> with Zen Financial ·
                  agents suggest <span className="font-semibold text-[#0F7A4A]">Fri 14:00</span> — zero clashes, panel free.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button className="rounded-full bg-[#16150F] px-6 py-2.5 text-[12px] font-semibold text-[#FAFAF8] hover:scale-[1.02]">
                    Approve — seal it
                  </button>
                  <button className="rounded-full border border-[#16150F]/15 bg-white px-5 py-2.5 text-[12px] font-semibold text-[#16150F] hover:border-[#16150F]">
                    Override…
                  </button>
                  <button className="rounded-full px-4 py-2.5 text-[12px] font-medium text-[#8B887C] hover:text-[#16150F]">Defer</button>
                </div>
              </article>
            </section>

            {/* right rail */}
            <section aria-label="Evidence and fairness" className="xl:col-span-4 space-y-4">
              {/* heat */}
              <div className="rounded-[22px] border border-[#ECEAE4] bg-white/70 p-5 backdrop-blur-xl">
                <div className="flex items-baseline justify-between">
                  <h2 className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#A8A698]">
                    Cohort heat
                  </h2>
                  <span className="text-[9px] text-[#C6C3B8]">mock #4</span>
                </div>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th />
                        {s.heatCohorts.map((c) => (
                          <th key={c} className="pb-1 text-[8px] font-bold text-[#A8A698]">{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {s.heatSkills.map((skill, i) => (
                        <tr key={skill}>
                          <th className="py-[2px] pr-2 text-left text-[10px] font-medium text-[#6F6C60]">
                            {skill}
                          </th>
                          {s.heat[i].map((v, j) => (
                            <td key={j} className="p-[2px]">
                              <span
                                className={`grid h-6 w-full min-w-8 place-items-center rounded-lg text-[8px] font-semibold ${v >= 4 ? "text-[#FAFAF8]" : v >= 3 ? "text-white" : "text-[#8B887C]"}`}
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
                <p className="mt-3 text-[10px] leading-snug text-[#6F6C60]">
                  <span className="font-semibold text-[#16150F]">SQL joins — 41% weak.</span> The
                  interview set tilts toward joins for exactly this reason.
                </p>
              </div>

              {/* fairness */}
              <div className="rounded-[22px] border border-[#D8F3E3] bg-[#F2FCF6]/80 p-5 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-[#10B981] text-white">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                      <path d="M2.3 7.4 5.3 10.2 11.7 3.6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-[12px] font-bold text-[#065F46]">Fairness check passed</p>
                    <p className="text-[9px] font-medium text-[#10B981]">parity 0.91 · p = 0.44</p>
                  </div>
                </div>
                <p className="mt-2.5 text-[10px] leading-snug text-[#065F46]/80">
                  No skew across the 7 shortlisted candidates. Any override is logged with a reason
                  and reviewed weekly.
                </p>
              </div>

              {/* protocol */}
              <div className="rounded-[22px] border border-[#ECEAE4] bg-white/70 p-5 backdrop-blur-xl">
                <h2 className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#A8A698]">
                  The fine print
                </h2>
                <ul className="mt-2 space-y-1.5 text-[10px] leading-snug text-[#6F6C60]">
                  <li className="flex gap-2"><span className={`${serif.className} italic text-[13px] text-[#B8A6FF]`}>i</span>Append-only, SHA-chained audit trail.</li>
                  <li className="flex gap-2"><span className={`${serif.className} italic text-[13px] text-[#B8A6FF]`}>ii</span>Overrides need a reason, minimum 8 chars.</li>
                  <li className="flex gap-2"><span className={`${serif.className} italic text-[13px] text-[#B8A6FF]`}>iii</span>NAAC / NIRF sealed exports.</li>
                </ul>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
