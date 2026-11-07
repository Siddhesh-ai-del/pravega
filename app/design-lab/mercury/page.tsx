import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import { SAMPLE } from "@/lib/design-lab/data";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});
const inter = Inter({ subsets: ["latin"] });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata = { title: "Pravega — Private Ledger (Direction 01)" };

const heatRamp = ["#ECE9DD", "#D9D6C4", "#A9AE93", "#5F7A63", "#10382B"];

function heatCell(v: number) {
  return { background: heatRamp[v], color: v >= 3 ? "#F5F3EC" : "#3A3F33" };
}

export default function PrivateLedgerDemo() {
  const s = SAMPLE;
  return (
    <div className={`${inter.className} min-h-screen bg-[#F5F3EC] text-[#1C2A22] flex`}>
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="hidden md:flex w-[250px] shrink-0 flex-col bg-[#10382B] text-[#E9E7DB]">
        <div className="px-6 pt-7 pb-6 border-b border-white/10">
          <p className={`${plexMono.className} text-[9px] uppercase tracking-[0.28em] text-[#C9A961]`}>
            VPPCOE &amp; VA · Est. 1983
          </p>
          <p className={`${fraunces.className} mt-2 text-[34px] leading-none font-semibold text-[#F5F3EC]`}>
            Pravega<span className="text-[#C9A961]">.</span>
          </p>
          <p className={`${plexMono.className} mt-2 text-[9px] uppercase tracking-[0.22em] text-[#9DB4A4]`}>
            The Verifying Ledger
          </p>
        </div>

        <nav aria-label="Main" className="px-3 py-4">
          <p className={`${plexMono.className} px-3 text-[9px] uppercase tracking-[0.22em] text-[#7E978A]`}>
            Registry
          </p>
          <ul className="mt-2 space-y-0.5">
            {s.nav.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  aria-current={item.active ? "page" : undefined}
                  className={`flex items-baseline justify-between rounded-md px-3 py-2 text-[13px] transition-colors ${
                    item.active
                      ? "bg-[#175034] text-[#F5F3EC] font-medium shadow-[inset_2px_0_0_#C9A961]"
                      : "text-[#A9BFAE] hover:text-[#F5F3EC] hover:bg-white/5"
                  }`}
                >
                  {item.label}
                  {item.active && (
                    <span className={`${plexMono.className} text-[9px] text-[#C9A961]`}>03</span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto px-6 py-5 border-t border-white/10">
          <div className="flex items-center gap-3">
            <span
              className={`${fraunces.className} grid h-10 w-10 place-items-center rounded-full border border-[#C9A961]/60 text-[15px] text-[#E9D9A8]`}
            >
              AD
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-medium text-[#F5F3EC] leading-tight">
                Anjali Deshmukh
              </span>
              <span className={`${plexMono.className} mt-0.5 block text-[8px] uppercase tracking-[0.2em] text-[#8CA692]`}>
                T&amp;P Officer · Signatory
              </span>
            </span>
          </div>
          <p className={`${plexMono.className} mt-4 text-[8px] leading-relaxed text-[#6E8A77]`}>
            FOR AUTHORIZED SIGN-OFF ONLY ·
            <br />
            EVERY ACTION APPENDS TO THE LEDGER
          </p>
        </div>
      </aside>

      {/* ── Content ─────────────────────────────────────────── */}
      <div className="min-w-0 flex-1">
        {/* top bar */}
        <header className="flex items-center justify-between gap-4 border-b border-[#E2DFCE] px-6 py-3 md:px-9">
          <p className={`${plexMono.className} text-[10px] uppercase tracking-[0.2em] text-[#6E6A58]`}>
            Placement Cell <span className="text-[#C9A961]">/</span> Drives{" "}
            <span className="text-[#C9A961]">/</span>{" "}
            <span className="text-[#10382B]">Nimbus Tech</span>
          </p>
          <div className="flex items-center gap-4">
            <p className={`${plexMono.className} hidden sm:block text-[10px] text-[#6E6A58]`}>
              {s.dateLine}
            </p>
            <span className={`${plexMono.className} hidden md:inline-block border border-[#B9A25E] px-2 py-1 text-[8px] uppercase tracking-[0.22em] text-[#8A6D1F]`}>
              Confidential
            </span>
          </div>
        </header>

        <main className="px-6 py-6 md:px-9 md:py-7">
          {/* title row */}
          <div className="flex flex-wrap items-end justify-between gap-6 border-b-2 border-[#10382B] pb-5">
            <div className="max-w-[56ch]">
              <p className={`${plexMono.className} text-[9px] uppercase tracking-[0.3em] text-[#8A6D1F]`}>
                Decisions awaiting your seal
              </p>
              <h1
                className={`${fraunces.className} mt-2 text-[44px] md:text-[54px] font-semibold leading-[1.02] tracking-tight text-[#10382B]`}
              >
                Decision <em className="font-medium italic text-[#175034]">Queue</em>
              </h1>
              <p className="mt-2 text-[13px] leading-snug text-[#54513F]">
                Agents propose. You dispose. Every sign-off writes to the audit ledger —
                signed, timestamped, and impossible to quietly edit.
              </p>
            </div>
            <div className="text-right">
              <p className={`${fraunces.className} text-[76px] leading-none font-semibold text-[#10382B]`}>
                3
              </p>
              <p className={`${plexMono.className} mt-1 text-[9px] uppercase tracking-[0.24em] text-[#6E6A58]`}>
                Pending sign-off
              </p>
            </div>
          </div>

          {/* KPI strip — a printed statement */}
          <dl className="mt-4 grid grid-cols-2 gap-y-4 md:grid-cols-4 md:gap-0 md:divide-x md:divide-[#E2DFCE] border-b border-[#E2DFCE] pb-4">
            {s.kpis.map((k) => (
              <div key={k.label} className="md:px-5 md:first:pl-0">
                <dt className={`${plexMono.className} text-[8px] uppercase tracking-[0.2em] text-[#6E6A58]`}>
                  {k.label}
                </dt>
                <dd className={`${fraunces.className} mt-1 text-[30px] leading-none font-semibold text-[#10382B]`}>
                  {k.value}
                </dd>
                <dd className={`${plexMono.className} mt-1 text-[8px] ${k.up === true ? "text-[#175034]" : "text-[#8A6D1F]"}`}>
                  {k.delta}
                </dd>
              </div>
            ))}
          </dl>

          {/* main grid */}
          <div className="mt-5 grid gap-5 xl:grid-cols-12">
            {/* queue column */}
            <section aria-label="Proposals" className="xl:col-span-8 space-y-4">
              {/* Card 1 — interview set, expanded */}
              <article className="rounded-[14px] border border-[#E2DFCE] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.05),0_12px_32px_-12px_rgba(16,56,43,0.25)]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className={`${plexMono.className} text-[9px] uppercase tracking-[0.2em] text-[#8A6D1F] border border-[#E4D9B4] bg-[#FBF7E8] px-2 py-1`}>
                      Case PVG-2026-0114
                    </span>
                    <span className={`${plexMono.className} text-[9px] uppercase tracking-[0.2em] text-[#175034]`}>
                      Interview Set
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`${plexMono.className} text-[9px] text-[#6E6A58]`}>CONF</span>
                    <span className="h-1 w-20 overflow-hidden rounded-full bg-[#ECE9DD]">
                      <span className="block h-full w-[92%] bg-[#C9A961]" />
                    </span>
                    <span className={`${plexMono.className} text-[10px] font-semibold text-[#10382B]`}>92</span>
                  </div>
                </div>
                <h2 className={`${fraunces.className} mt-3 text-[22px] leading-tight font-semibold text-[#10382B]`}>
                  Nimbus Tech — Backend Dev interview set
                </h2>
                <p className="mt-1 text-[11px] text-[#54513F]">
                  <span className={`${plexMono.className} text-[9px] uppercase text-[#8A6D1F]`}>Why — </span>
                  JD skills [sql · node · docker] + cohort weakness: SQL joins (41% weak)
                </p>
                <ol className="mt-3 divide-y divide-dashed divide-[#E2DFCE] rounded-md border border-[#ECE9DD] bg-[#FCFBF6]">
                  {s.queue[0].lines?.map((q, i) => (
                    <li key={i} className="flex items-baseline gap-3 px-4 py-2.5 text-[12px] leading-snug text-[#2A332B]">
                      <span className={`${plexMono.className} text-[9px] text-[#C9A961]`}>Q{i + 1}</span>
                      {q}
                    </li>
                  ))}
                </ol>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button className="inline-flex items-center gap-2 rounded-full bg-[#10382B] px-5 py-2 text-[12px] font-medium text-[#F5F3EC] transition-colors hover:bg-[#175034]">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                      <path d="M2 6.5 4.8 9 10 3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Approve &amp; seal
                  </button>
                  <button className="rounded-full border border-[#10382B]/25 px-5 py-2 text-[12px] font-medium text-[#10382B] transition-colors hover:border-[#10382B] hover:bg-[#10382B] hover:text-[#F5F3EC]">
                    Override…
                  </button>
                  <button className="rounded-full px-4 py-2 text-[12px] text-[#6E6A58] underline underline-offset-4 decoration-[#D8D4C4] hover:text-[#10382B]">
                    Defer 24h
                  </button>
                  <span className={`${plexMono.className} ml-auto hidden lg:block text-[8px] uppercase tracking-[0.2em] text-[#A39F8B]`}>
                    agr-1 · council 3/3
                  </span>
                </div>
              </article>

              {/* Card 2 — eligibility sweep */}
              <article className="rounded-[14px] border border-[#E2DFCE] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.05),0_12px_32px_-12px_rgba(16,56,43,0.22)]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className={`${plexMono.className} text-[9px] uppercase tracking-[0.2em] text-[#8A6D1F] border border-[#E4D9B4] bg-[#FBF7E8] px-2 py-1`}>
                      Case PVG-2026-0115
                    </span>
                    <span className={`${plexMono.className} text-[9px] uppercase tracking-[0.2em] text-[#175034]`}>
                      Eligibility sweep
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`${plexMono.className} text-[9px] text-[#6E6A58]`}>CONF</span>
                    <span className="h-1 w-20 overflow-hidden rounded-full bg-[#ECE9DD]">
                      <span className="block h-full w-[88%] bg-[#C9A961]" />
                    </span>
                    <span className={`${plexMono.className} text-[10px] font-semibold text-[#10382B]`}>88</span>
                  </div>
                </div>
                <h3 className={`${fraunces.className} mt-3 text-[19px] leading-snug font-semibold text-[#10382B]`}>
                  Nimbus Tech — eligibility sweep <span className="text-[#8A6D1F]">· 7 students</span>
                </h3>
                <p className="mt-1 text-[11px] text-[#54513F]">
                  <span className="font-semibold text-[#175034]">3 eligible</span> · rule v3 · be-track
                </p>
                <ul className="mt-2 space-y-1">
                  {s.queue[1].blocked?.map((b) => (
                    <li key={b} className="flex items-baseline gap-2 text-[11px] text-[#6E2A2A]">
                      <span aria-hidden className="text-[#8E2A2B]">▪</span>
                      <span className={`${plexMono.className} text-[10px]`}>{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button className="inline-flex items-center gap-2 rounded-full bg-[#10382B] px-5 py-2 text-[12px] font-medium text-[#F5F3EC] hover:bg-[#175034]">
                    Approve &amp; seal
                  </button>
                  <button className="rounded-full border border-[#10382B]/25 px-5 py-2 text-[12px] font-medium text-[#10382B] hover:border-[#10382B]">
                    Override…
                  </button>
                  <button className="rounded-full px-4 py-2 text-[12px] text-[#6E6A58] underline underline-offset-4 decoration-[#D8D4C4]">
                    Defer
                  </button>
                </div>
              </article>

              {/* Card 3 — schedule draft */}
              <article className="rounded-[14px] border border-[#E2DFCE] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.05),0_12px_32px_-12px_rgba(16,56,43,0.22)]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className={`${plexMono.className} text-[9px] uppercase tracking-[0.2em] text-[#8A6D1F] border border-[#E4D9B4] bg-[#FBF7E8] px-2 py-1`}>
                      Case PVG-2026-0116
                    </span>
                    <span className={`${plexMono.className} text-[9px] uppercase tracking-[0.2em] text-[#175034]`}>
                      Schedule draft
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`${plexMono.className} text-[9px] text-[#6E6A58]`}>CONF</span>
                    <span className="h-1 w-20 overflow-hidden rounded-full bg-[#ECE9DD]">
                      <span className="block h-full w-[90%] bg-[#C9A961]" />
                    </span>
                    <span className={`${plexMono.className} text-[10px] font-semibold text-[#10382B]`}>90</span>
                  </div>
                </div>
                <h3 className={`${fraunces.className} mt-3 text-[19px] leading-snug font-semibold text-[#10382B]`}>
                  Nimbus Tech — 2 slots · Thu 14:00 / Fri 10:00
                </h3>
                <div className="mt-2 rounded-md border border-[#E7D9A8] bg-[#FDF9E7] px-3 py-2 text-[11px] text-[#6E5A10]">
                  <span className={`${plexMono.className} text-[9px] uppercase tracking-[0.18em]`}>Clash — </span>
                  Zen Financial uses Fri 10:00
                </div>
                <p className="mt-2 text-[11px] text-[#175034]">
                  <span className={`${plexMono.className} text-[9px] uppercase tracking-[0.18em]`}>Suggestion — </span>
                  Move Nimbus to Fri 14:00 · zero clashes, panel free
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button className="inline-flex items-center gap-2 rounded-full bg-[#10382B] px-5 py-2 text-[12px] font-medium text-[#F5F3EC] hover:bg-[#175034]">
                    Approve &amp; seal
                  </button>
                  <button className="rounded-full border border-[#10382B]/25 px-5 py-2 text-[12px] font-medium text-[#10382B] hover:border-[#10382B]">
                    Override…
                  </button>
                  <button className="rounded-full px-4 py-2 text-[12px] text-[#6E6A58] underline underline-offset-4 decoration-[#D8D4C4]">
                    Defer
                  </button>
                </div>
              </article>
            </section>

            {/* right rail */}
            <section aria-label="Evidence and fairness" className="xl:col-span-4 space-y-4">
              <div className="rounded-[14px] border border-[#E2DFCE] bg-[#FBFAF4] p-5">
                <div className="flex items-baseline justify-between">
                  <h2 className={`${plexMono.className} text-[9px] uppercase tracking-[0.26em] text-[#6E6A58]`}>
                    Cohort heat · last mock
                  </h2>
                  <span className={`${plexMono.className} text-[8px] text-[#A39F8B]`}>FIG. 1</span>
                </div>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full border-collapse text-center">
                    <thead>
                      <tr>
                        <th className="pb-1 text-left" />
                        {s.heatCohorts.map((c) => (
                          <th key={c} className={`${plexMono.className} pb-1 text-[9px] font-medium text-[#6E6A58]`}>
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {s.heatSkills.map((skill, i) => (
                        <tr key={skill}>
                          <th className="py-0.5 pr-2 text-left text-[10px] font-normal text-[#3A3F33]">
                            {skill}
                          </th>
                          {s.heat[i].map((v, j) => (
                            <td key={j} className="p-0.5">
                              <span
                                className="grid h-6 w-8 place-items-center rounded-[4px] text-[8px]"
                                style={heatCell(v)}
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
                <p className="mt-3 border-t border-dashed border-[#D8D4C4] pt-2 text-[10px] leading-snug text-[#54513F]">
                  <span className="font-semibold text-[#10382B]">SQL joins — 41% weak</span> across BE
                  &amp; CE; flagged by agr-1 when drafting the interview set.
                </p>
              </div>

              <div className="rounded-[14px] border border-[#DDE7DD] bg-[#F2F8F2] p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full border border-[#175034]/40 text-[#175034]">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                      <path d="M2.2 7.4 5.4 10.4 11.8 3.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-[12px] font-semibold text-[#175034]">Fairness check passed</p>
                    <p className={`${plexMono.className} mt-0.5 text-[8px] uppercase tracking-[0.16em] text-[#4E7A5F]`}>
                      Selection rate parity 0.91 · p = 0.44
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-[10px] leading-snug text-[#3A5344]">
                  No cohort skew across the 7 shortlisted candidates. Overrides would be logged
                  with reason and reviewed at the weekly audit.
                </p>
              </div>

              <div className="rounded-[14px] border border-[#E2DFCE] p-5">
                <h2 className={`${plexMono.className} text-[9px] uppercase tracking-[0.26em] text-[#6E6A58]`}>
                  Ledger protocol
                </h2>
                <ul className="mt-2 space-y-1.5 text-[10px] leading-snug text-[#54513F]">
                  <li className="flex gap-2"><span className="text-[#C9A961]">I.</span> Every decision is appended, never edited.</li>
                  <li className="flex gap-2"><span className="text-[#C9A961]">II.</span> Overrides require a reason · min 8 chars.</li>
                  <li className="flex gap-2"><span className="text-[#C9A961]">III.</span> Exports carry the NAAC/NIRF audit seal.</li>
                </ul>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
