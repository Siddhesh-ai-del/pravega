import { Inter, JetBrains_Mono } from "next/font/google";
import { SAMPLE } from "@/lib/design-lab/data";

const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata = { title: "Pravega — Mission Control (Direction 02)" };

const heatBg = ["rgba(255,255,255,0.03)", "rgba(110,108,255,0.18)", "rgba(110,108,255,0.34)", "rgba(110,108,255,0.55)", "#6E6CFF"];

const icons: Record<string, React.ReactNode> = {
  "Decision Queue": (
    <path d="M3 4.5h10M3 8h7M3 11.5h4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  ),
  "Cohort Heatmap": (
    <path d="M3.5 3.5h3v3h-3zM9.5 3.5h3v3h-3zM3.5 9.5h3v3h-3zM9.5 9.5h3v3h-3z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
  ),
  "Eligibility Rules": (
    <path d="M4 5h8M4 8h8M4 11h8M6.5 3.5v3M10 6.5v3M8 9.5v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  ),
  "Fairness Check": (
    <path d="M8 3v9M5 12.5h6M4 5.5h8M4 5.5 2.5 9a2.6 2.6 0 0 0 3 .0zM12 5.5 10.5 9a2.6 2.6 0 0 0 3 .0z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  ),
  "Audit Trail": (
    <path d="M3 4h10M3 8h10M3 12h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  ),
};

export default function MissionControlDemo() {
  const s = SAMPLE;
  return (
    <div className={`${inter.className} relative min-h-screen overflow-hidden bg-[#08090C] text-[#E6E7EC] flex`}>
      {/* ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/3 h-96 w-[42rem] rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(110,108,255,0.22), transparent)" }}
      />

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="relative hidden md:flex w-[236px] shrink-0 flex-col border-r border-white/[0.06] bg-[#0C0D11]">
        <div className="px-5 pt-6 pb-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <span className="grid h-7 w-7 place-items-center rounded-[7px] bg-gradient-to-br from-[#8B89FF] to-[#4B49C8] shadow-[0_0_18px_rgba(110,108,255,0.45)]">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
                <path d="M2.2 6.8 5.2 9.6 10.8 3.2" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div>
              <p className="text-[16px] font-semibold tracking-[-0.02em] text-white leading-none">
                Pravega
              </p>
              <p className={`${mono.className} mt-1 text-[8px] uppercase tracking-[0.24em] text-[#7E7F88]`}>
                Verifying Ledger
              </p>
            </div>
          </div>
        </div>

        <nav aria-label="Main" className="px-3 py-4">
          <p className={`${mono.className} px-2 text-[8px] uppercase tracking-[0.26em] text-[#5B5C66]`}>
            Console
          </p>
          <ul className="mt-2 space-y-0.5">
            {s.nav.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  aria-current={item.active ? "page" : undefined}
                  className={`group relative flex items-center gap-2.5 rounded-md px-2 py-[7px] text-[13px] transition-colors ${
                    item.active
                      ? "bg-white/[0.06] text-white"
                      : "text-[#8A8B94] hover:text-[#E6E7EC] hover:bg-white/[0.04]"
                  }`}
                >
                  {item.active && (
                    <span aria-hidden className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-[#6E6CFF]" />
                  )}
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden className={item.active ? "text-[#8B89FF]" : "text-[#5B5C66] group-hover:text-[#A9AAB4]"}>
                    {icons[item.label]}
                  </svg>
                  {item.label}
                  {item.active && (
                    <kbd className={`${mono.className} ml-auto rounded border border-white/10 bg-white/[0.04] px-1 text-[9px] text-[#A9AAB4]`}>
                      1
                    </kbd>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto px-5 py-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-white/[0.06] text-[11px] font-medium text-[#C9CAD2]">
              AD
            </span>
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-[#E6E7EC] leading-tight">Anjali Deshmukh</p>
              <p className={`${mono.className} mt-0.5 text-[8px] uppercase tracking-[0.2em] text-[#5B5C66]`}>
                T&amp;P Officer
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Content ─────────────────────────────────────────── */}
      <div className="relative min-w-0 flex-1">
        {/* top bar */}
        <header className="flex items-center justify-between gap-4 border-b border-white/[0.06] px-5 py-3 md:px-7">
          <p className={`${mono.className} text-[10px] text-[#5B5C66]`}>
            <span className="text-[#8A8B94]">placement</span> / nimbus-tech /{" "}
            <span className="text-[#C9CAD2]">decision-queue</span>
          </p>
          <div className="flex items-center gap-3">
            <label className="hidden sm:flex h-8 w-56 items-center gap-2 rounded-md border border-white/[0.08] bg-white/[0.04] px-2.5 text-[12px] text-[#8A8B94] focus-within:border-[#6E6CFF]/50">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path d="M5.5 9.5a4 4 0 1 1 0-8 4 4 0 0 1 0 8ZM8.5 8.5 11 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <span className="truncate">Search cases, students, rules…</span>
              <kbd className={`${mono.className} ml-auto shrink-0 rounded border border-white/10 px-1 text-[9px]`}>⌘K</kbd>
            </label>
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] py-1 pl-2 pr-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className={`${mono.className} text-[8px] uppercase tracking-[0.18em] text-emerald-300`}>Live demo</span>
            </span>
          </div>
        </header>

        <main className="px-5 py-5 md:px-7 md:py-6">
          {/* title row */}
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className={`${mono.className} text-[9px] uppercase tracking-[0.3em] text-[#6E6CFF]`}>
                ◈ Nimbus Tech — Backend Dev drive
              </p>
              <h1 className="mt-2 text-[32px] md:text-[36px] font-semibold tracking-[-0.03em] leading-none text-white">
                Decision Queue
              </h1>
              <p className="mt-2 max-w-[52ch] text-[13px] leading-snug text-[#8A8B94]">
                Agents propose. You dispose. Every approve, override and defer is appended to
                the audit ledger — reversible only by a new entry.
              </p>
            </div>
            <div className="flex items-center gap-5 rounded-xl border border-white/[0.06] bg-white/[0.03] px-5 py-3">
              <div>
                <p className={`${mono.className} text-[8px] uppercase tracking-[0.24em] text-[#5B5C66]`}>Pending</p>
                <p className="mt-1 text-[26px] leading-none font-semibold text-white tabular-nums">3</p>
              </div>
              <div className="h-9 w-px bg-white/[0.08]" />
              <div>
                <p className={`${mono.className} text-[8px] uppercase tracking-[0.24em] text-[#5B5C66]`}>Oldest</p>
                <p className="mt-1 text-[26px] leading-none font-semibold text-[#FFC53D] tabular-nums">2h<span className="text-[15px]"> 41m</span></p>
              </div>
            </div>
          </div>

          {/* KPI strip */}
          <dl className="mt-5 grid grid-cols-2 divide-x divide-white/[0.06] border-y border-white/[0.06] md:grid-cols-4">
            {s.kpis.map((k) => (
              <div key={k.label} className="px-4 py-3 first:pl-0 md:px-5">
                <dt className={`${mono.className} text-[8px] uppercase tracking-[0.2em] text-[#5B5C66]`}>
                  {k.label}
                </dt>
                <dd className="mt-1.5 text-[22px] leading-none font-semibold tracking-tight text-[#F4F4F6] tabular-nums">
                  {k.value}
                </dd>
                <dd className={`${mono.className} mt-1 text-[8px] ${k.up === true ? "text-emerald-400" : "text-[#8A8B94]"}`}>
                  {k.delta}
                </dd>
              </div>
            ))}
          </dl>

          {/* main grid */}
          <div className="mt-5 grid gap-4 xl:grid-cols-12">
            {/* queue column */}
            <section aria-label="Proposals" className="xl:col-span-8 space-y-3">
              {/* Card 1 — interview set */}
              <article className="group rounded-xl border border-white/[0.06] bg-[#0F1015] transition-colors hover:border-white/[0.12]">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`${mono.className} rounded border border-[#6E6CFF]/30 bg-[#6E6CFF]/10 px-2 py-0.5 text-[8px] uppercase tracking-[0.2em] text-[#A5A3FF]`}>
                      Interview Set
                    </span>
                    <span className={`${mono.className} text-[9px] text-[#5B5C66]`}>PVG-2026-0114 · agr-1</span>
                  </div>
                  <div className="flex items-center gap-2" aria-label="Confidence 92 percent">
                    <span className={`${mono.className} text-[8px] uppercase text-[#5B5C66]`}>conf</span>
                    <span className="flex gap-[3px]">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <span key={i} className={`h-1.5 w-4 rounded-[2px] ${i < 5 ? "bg-[#6E6CFF]" : "bg-white/[0.08]"}`} />
                      ))}
                    </span>
                    <span className={`${mono.className} text-[10px] font-semibold text-[#C9CAD2]`}>92</span>
                  </div>
                </div>
                <div className="px-4 py-3.5">
                  <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-[#F4F4F6]">
                    Nimbus Tech — Backend Dev interview set
                  </h2>
                  <p className="mt-1 text-[11px] leading-snug text-[#8A8B94]">
                    <span className={`${mono.className} text-[8px] uppercase tracking-[0.18em] text-[#6E6CFF]`}>why </span>
                    JD skills [sql · node · docker] + cohort weakness — SQL joins 41% weak
                  </p>
                  <ul className="mt-3 divide-y divide-white/[0.05] border-y border-white/[0.05]">
                    {s.queue[0].lines?.map((q, i) => (
                      <li key={i} className="flex items-baseline gap-3 py-2 text-[12px] leading-snug text-[#C9CAD2]">
                        <span className={`${mono.className} text-[8px] text-[#6E6CFF]`}>Q{i + 1}</span>
                        {q}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button className="inline-flex items-center gap-1.5 rounded-md bg-[#5E6AD2] px-3.5 py-[7px] text-[12px] font-medium text-white transition-colors hover:bg-[#6E6CF0]">
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
                        <path d="M1.8 5.9 4.4 8.3 9.2 2.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Approve
                    </button>
                    <button className="rounded-md border border-white/[0.12] px-3.5 py-[7px] text-[12px] font-medium text-[#E6E7EC] transition-colors hover:border-white/25 hover:bg-white/[0.04]">
                      Override…
                    </button>
                    <button className="rounded-md px-3 py-[7px] text-[12px] text-[#8A8B94] transition-colors hover:text-white">
                      Defer
                    </button>
                    <span className={`${mono.className} ml-auto hidden lg:block text-[8px] uppercase tracking-[0.2em] text-[#5B5C66]`}>
                      council 3/3 · agr-1
                    </span>
                  </div>
                </div>
              </article>

              {/* Card 2 — eligibility sweep */}
              <article className="rounded-xl border border-white/[0.06] bg-[#0F1015]">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`${mono.className} rounded border border-[#6E6CFF]/30 bg-[#6E6CFF]/10 px-2 py-0.5 text-[8px] uppercase tracking-[0.2em] text-[#A5A3FF]`}>
                      Eligibility Sweep
                    </span>
                    <span className={`${mono.className} text-[9px] text-[#5B5C66]`}>PVG-2026-0115 · agr-2</span>
                  </div>
                  <div className="flex items-center gap-2" aria-label="Confidence 88 percent">
                    <span className={`${mono.className} text-[8px] uppercase text-[#5B5C66]`}>conf</span>
                    <span className="flex gap-[3px]">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <span key={i} className={`h-1.5 w-4 rounded-[2px] ${i < 4 ? "bg-[#6E6CFF]" : "bg-white/[0.08]"}`} />
                      ))}
                    </span>
                    <span className={`${mono.className} text-[10px] font-semibold text-[#C9CAD2]`}>88</span>
                  </div>
                </div>
                <div className="px-4 py-3">
                  <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-[#F4F4F6]">
                    Nimbus Tech — eligibility sweep <span className="text-[#8A8B94] font-normal">· 7 students</span>
                  </h3>
                  <p className="mt-1 text-[11px] text-[#8A8B94]">
                    <span className="text-emerald-400 font-medium">3 eligible</span> · rule v3 · be-track
                  </p>
                  <ul className="mt-2 space-y-1">
                    {s.queue[1].blocked?.map((b) => (
                      <li key={b} className="flex items-baseline gap-2 text-[10px] text-[#FF8F8F]">
                        <span aria-hidden className="text-[#FF6369]">×</span>
                        <span className={mono.className}>{b}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button className="inline-flex items-center gap-1.5 rounded-md bg-[#5E6AD2] px-3.5 py-[7px] text-[12px] font-medium text-white hover:bg-[#6E6CF0]">
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
                        <path d="M1.8 5.9 4.4 8.3 9.2 2.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Approve
                    </button>
                    <button className="rounded-md border border-white/[0.12] px-3.5 py-[7px] text-[12px] font-medium text-[#E6E7EC] hover:border-white/25">
                      Override…
                    </button>
                    <button className="rounded-md px-3 py-[7px] text-[12px] text-[#8A8B94] hover:text-white">
                      Defer
                    </button>
                  </div>
                </div>
              </article>

              {/* Card 3 — schedule draft */}
              <article className="rounded-xl border border-white/[0.06] bg-[#0F1015]">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`${mono.className} rounded border border-[#6E6CFF]/30 bg-[#6E6CFF]/10 px-2 py-0.5 text-[8px] uppercase tracking-[0.2em] text-[#A5A3FF]`}>
                      Schedule Draft
                    </span>
                    <span className={`${mono.className} text-[9px] text-[#5B5C66]`}>PVG-2026-0116 · agr-3</span>
                  </div>
                  <div className="flex items-center gap-2" aria-label="Confidence 90 percent">
                    <span className={`${mono.className} text-[8px] uppercase text-[#5B5C66]`}>conf</span>
                    <span className="flex gap-[3px]">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <span key={i} className={`h-1.5 w-4 rounded-[2px] ${i < 5 ? "bg-[#6E6CFF]" : "bg-white/[0.08]"}`} />
                      ))}
                    </span>
                    <span className={`${mono.className} text-[10px] font-semibold text-[#C9CAD2]`}>90</span>
                  </div>
                </div>
                <div className="px-4 py-3">
                  <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-[#F4F4F6]">
                    Nimbus Tech — 2 slots <span className="text-[#8A8B94] font-normal">· Thu 14:00 / Fri 10:00</span>
                  </h3>
                  <div className="mt-2 rounded-md border border-[#FFC53D]/20 bg-[#FFC53D]/[0.06] px-3 py-1.5 text-[10px] text-[#FFD78A]">
                    <span className={`${mono.className} text-[8px] uppercase tracking-[0.18em] text-[#FFC53D]`}>clash </span>
                    Zen Financial uses Fri 10:00
                  </div>
                  <p className="mt-1.5 text-[10px] text-emerald-400/90">
                    <span className={`${mono.className} text-[8px] uppercase tracking-[0.18em] text-emerald-500`}>fix </span>
                    Move Nimbus to Fri 14:00 — zero clashes, panel free
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button className="inline-flex items-center gap-1.5 rounded-md bg-[#5E6AD2] px-3.5 py-[7px] text-[12px] font-medium text-white hover:bg-[#6E6CF0]">
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
                        <path d="M1.8 5.9 4.4 8.3 9.2 2.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Approve
                    </button>
                    <button className="rounded-md border border-white/[0.12] px-3.5 py-[7px] text-[12px] font-medium text-[#E6E7EC] hover:border-white/25">
                      Override…
                    </button>
                    <button className="rounded-md px-3 py-[7px] text-[12px] text-[#8A8B94] hover:text-white">
                      Defer
                    </button>
                  </div>
                </div>
              </article>

              <p className={`${mono.className} hidden md:flex items-center gap-3 px-1 pt-1 text-[8px] uppercase tracking-[0.18em] text-[#5B5C66]`}>
                <kbd className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5">↑↓</kbd> navigate
                <kbd className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5">A</kbd> approve
                <kbd className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5">O</kbd> override
                <kbd className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5">D</kbd> defer
              </p>
            </section>

            {/* right rail */}
            <section aria-label="Evidence and fairness" className="xl:col-span-4 space-y-3">
              <div className="rounded-xl border border-white/[0.06] bg-[#0F1015] p-4">
                <div className="flex items-baseline justify-between">
                  <h2 className={`${mono.className} text-[8px] uppercase tracking-[0.28em] text-[#5B5C66]`}>
                    Cohort heat · mock #4
                  </h2>
                  <span className={`${mono.className} text-[8px] text-[#3F4049]`}>fig.1</span>
                </div>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th />
                        {s.heatCohorts.map((c) => (
                          <th key={c} className={`${mono.className} pb-1.5 text-[8px] font-medium text-[#5B5C66]`}>
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {s.heatSkills.map((skill, i) => (
                        <tr key={skill}>
                          <th className="py-[3px] pr-2 text-left text-[10px] font-normal text-[#A9AAB4]">
                            {skill}
                          </th>
                          {s.heat[i].map((v, j) => (
                            <td key={j} className="p-[2px]">
                              <span
                                className={`grid h-6 w-full min-w-8 place-items-center rounded-[4px] text-[8px] ${mono.className} ${v >= 3 ? "text-white" : "text-[#8A8B94]"}`}
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
                <p className="mt-3 border-t border-white/[0.06] pt-2 text-[10px] leading-snug text-[#8A8B94]">
                  <span className="text-[#F4F4F6] font-medium">SQL joins — 41% weak</span> in BE &amp; CE.
                  agr-1 weighted the set toward joins for this reason.
                </p>
              </div>

              <div className="rounded-xl border border-emerald-400/[0.15] bg-emerald-400/[0.05] p-4">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-7 w-7 place-items-center rounded-full border border-emerald-400/30 text-emerald-400">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                      <path d="M2 6.3 4.8 9 10 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-[12px] font-semibold text-emerald-300">Fairness passed</p>
                    <p className={`${mono.className} mt-0.5 text-[8px] uppercase tracking-[0.16em] text-emerald-500/80`}>
                      parity 0.91 · χ² p = 0.44
                    </p>
                  </div>
                </div>
                <p className="mt-2.5 text-[10px] leading-snug text-emerald-100/60">
                  No skew across the 7 shortlisted candidates. Any override is logged with a
                  mandatory reason and reviewed weekly.
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.06] p-4">
                <h2 className={`${mono.className} text-[8px] uppercase tracking-[0.28em] text-[#5B5C66]`}>
                  Ledger invariant
                </h2>
                <p className="mt-2 text-[10px] leading-relaxed text-[#8A8B94]">
                  Approves are one-way. The trail is append-only and SHA-chained — reversals are
                  new entries, never edits. Exports carry the NAAC / NIRF audit seal.
                </p>
                <button className="mt-3 w-full rounded-md border border-white/[0.1] py-1.5 text-[10px] font-medium text-[#C9CAD2] transition-colors hover:border-white/25 hover:text-white">
                  Export audit pack ↓
                </button>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
