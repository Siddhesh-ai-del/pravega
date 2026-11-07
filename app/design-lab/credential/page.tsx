import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import { SAMPLE } from "@/lib/design-lab/data";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});
const inter = Inter({ subsets: ["latin"] });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata = { title: "Pravega — Verifying Authority (Direction 05)" };

const heatBg = ["#EDEBE2", "#DCD8C8", "#B9B49C", "#6E6A50", "#16233B"];

function Seal({ size = 92 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="Seal of the verifying authority">
      <circle cx="50" cy="50" r="48" fill="#16233B" />
      <circle cx="50" cy="50" r="44.5" fill="none" stroke="#B08D2E" strokeWidth="1.4" />
      <circle cx="50" cy="50" r="30" fill="none" stroke="#B08D2E" strokeWidth="1.4" />
      <defs>
        <path id="sealArcTop" d="M50 12 a38 38 0 0 1 0.01 0" fill="none" />
        <path id="sealArc" d="M 50,50 m -37,0 a 37,37 0 1,1 74,0" fill="none" />
      </defs>
      <text fontFamily="IBM Plex Mono, monospace" fontSize="8.2" fill="#B08D2E" letterSpacing="2.2">
        <textPath href="#sealArc" startOffset="0%">
          VPPCOE · VERIFIED · VPPCOE · VERIFIED · VPPCOE · VERIFIED ·
        </textPath>
      </text>
      <path d="M36 51.5 46 61 66 38" fill="none" stroke="#F5F3EC" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function VerifyingAuthorityDemo() {
  const s = SAMPLE;
  return (
    <div className={`${inter.className} relative min-h-screen bg-[#FBFAF6] text-[#16233B] flex`}>
      {/* gazette double rule */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-10">
        <div className="h-[6px] bg-[#16233B]" />
        <div className="mt-[2px] h-[2px] bg-[#B08D2E]" />
      </div>

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="relative hidden md:flex w-[252px] shrink-0 flex-col border-r border-[#16233B] bg-[#16233B] text-[#EDEAE0]">
        <div className="px-6 pt-9 pb-6 border-b border-white/10">
          <p className={`${mono.className} text-[8px] uppercase tracking-[0.3em] text-[#B08D2E]`}>
            Est. 1983 · VPPCOE &amp; VA
          </p>
          <p className={`${fraunces.className} mt-2 text-[36px] leading-none font-semibold text-[#FBFAF6]`}>
            Pravega<span className="text-[#B08D2E]">.</span>
          </p>
          <p className={`${mono.className} mt-2 text-[8px] uppercase leading-relaxed tracking-[0.24em] text-[#8C97B1]`}>
            The Verifying<br />Authority
          </p>
        </div>

        <nav aria-label="Main" className="px-3 py-5">
          <p className={`${mono.className} px-3 text-[8px] uppercase tracking-[0.3em] text-[#61708F]`}>
            Register
          </p>
          <ul className="mt-2">
            {s.nav.map((item, i) => (
              <li key={item.label} className="border-b border-white/[0.06] last:border-0">
                <a
                  href={item.href}
                  aria-current={item.active ? "page" : undefined}
                  className={`flex items-baseline gap-3 px-3 py-2.5 text-[13px] transition-colors ${
                    item.active
                      ? "text-[#FBFAF6]"
                      : "text-[#9AA6C0] hover:text-[#FBFAF6]"
                  }`}
                >
                  <span className={`${mono.className} text-[8px] text-[#B08D2E]`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={item.active ? "font-semibold underline underline-offset-[6px] decoration-[#B08D2E] decoration-2" : ""}>
                    {item.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto px-6 pb-6 pt-4 border-t border-white/10">
          <div className="flex items-center gap-4">
            <Seal size={64} />
            <div className="min-w-0">
              <p className="text-[13px] font-semibold leading-tight text-[#FBFAF6]">Anjali Deshmukh</p>
              <p className={`${mono.className} mt-1 text-[8px] uppercase leading-relaxed tracking-[0.18em] text-[#8C97B1]`}>
                T&amp;P Officer<br />Authorised Signatory
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Content ─────────────────────────────────────────── */}
      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between gap-4 border-b border-[#16233B]/15 px-6 pb-3 pt-6 md:px-9">
          <p className={`${mono.className} text-[9px] uppercase tracking-[0.28em] text-[#61708F]`}>
            Case File <span className="text-[#B08D2E]">PVG-2026</span> · Nimbus Tech (Backend)
          </p>
          <p className={`${mono.className} hidden sm:block text-[9px] uppercase tracking-[0.2em] text-[#61708F]`}>
            {s.dateLine}
          </p>
        </header>

        <main className="px-6 pb-6 pt-4 md:px-9">
          {/* title row */}
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[#16233B] pb-4">
            <div className="max-w-[56ch]">
              <p className={`${mono.className} text-[8px] uppercase tracking-[0.32em] text-[#8E2A2B]`}>
                For the Officer&rsquo;s seal — not for distribution
              </p>
              <h1 className={`${fraunces.className} mt-2 text-[46px] md:text-[56px] font-semibold leading-[1.0] tracking-[-0.01em] text-[#16233B]`}>
                Decision <em className="italic font-medium text-[#8E2A2B]">Queue</em>
              </h1>
              <p className="mt-2 max-w-[48ch] text-[12px] leading-snug text-[#3D4A63]">
                Agents have prepared the record. The officer&rsquo;s seal, and nothing else,
                authorises it. Every seal appends to the permanent register.
              </p>
            </div>
            <div className="hidden md:block">
              <Seal size={96} />
            </div>
          </div>

          {/* KPI statement */}
          <dl className="grid grid-cols-2 border-b-[3px] border-double border-[#16233B]/40 py-3 md:grid-cols-4 md:divide-x md:divide-[#16233B]/15">
            {s.kpis.map((k) => (
              <div key={k.label} className="md:px-5 md:first:pl-0">
                <dt className={`${mono.className} text-[8px] uppercase tracking-[0.2em] text-[#61708F]`}>
                  {k.label}
                </dt>
                <dd className={`${fraunces.className} mt-1 text-[28px] leading-none font-semibold text-[#16233B] tabular-nums`}>
                  {k.value}
                </dd>
                <dd className={`${mono.className} mt-0.5 text-[8px] ${k.up === true ? "text-[#1E6F4C]" : "text-[#8E2A2B]"}`}>
                  {k.delta}
                </dd>
              </div>
            ))}
          </dl>

          {/* main grid */}
          <div className="mt-5 grid gap-5 xl:grid-cols-12">
            {/* queue column — the dossier */}
            <section aria-label="Proposals" className="xl:col-span-8 space-y-4">
              {/* Card 1 */}
              <article className="relative border border-[#16233B]/20 bg-white p-5 shadow-[0_1px_0_#16233B]">
                <span
                  aria-hidden
                  className={`${mono.className} absolute right-4 top-4 rotate-[-3deg] border-2 border-[#8E2A2B] px-2 py-1 text-[8px] font-semibold uppercase leading-tight tracking-[0.22em] text-[#8E2A2B] opacity-90`}
                >
                  Awaiting<br />Sign-off
                </span>
                <p className={`${mono.className} text-[8px] uppercase tracking-[0.28em] text-[#61708F]`}>
                  Exhibit A · Case PVG-2026-0114
                </p>
                <h2 className={`${fraunces.className} mt-2 max-w-[34ch] text-[23px] font-semibold leading-[1.15] text-[#16233B]`}>
                  Nimbus Tech — Backend Dev interview set
                </h2>
                <p className="mt-1.5 max-w-[56ch] text-[11px] leading-snug text-[#3D4A63]">
                  <span className="font-semibold text-[#8E2A2B]">Ground:</span> JD skills
                  [sql · node · docker]; cohort weakness — SQL joins, 41% below bar.
                </p>
                <ol className="mt-3 border-t border-[#16233B]/12">
                  {s.queue[0].lines?.map((q, i) => (
                    <li key={i} className="flex items-baseline gap-4 border-b border-[#16233B]/12 py-2.5 text-[12px] leading-snug text-[#22304E]">
                      <span className={`${mono.className} shrink-0 text-[9px] uppercase text-[#B08D2E]`}>
                        Q.{i + 1}
                      </span>
                      {q}
                    </li>
                  ))}
                </ol>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button className={`${inter.className} inline-flex items-center gap-2 bg-[#16233B] px-6 py-2.5 text-[12px] font-semibold tracking-wide text-[#FBFAF6] transition-colors hover:bg-[#1F3050]`}>
                    Seal &amp; sign
                  </button>
                  <button className="border border-[#8E2A2B] px-5 py-2.5 text-[12px] font-semibold text-[#8E2A2B] transition-colors hover:bg-[#8E2A2B] hover:text-[#FBFAF6]">
                    Override — enter reason
                  </button>
                  <button className="px-4 py-2.5 text-[12px] text-[#61708F] underline decoration-[#C9C6B8] underline-offset-4 hover:text-[#16233B]">
                    Hold 24h
                  </button>
                  <span className={`${mono.className} ml-auto hidden lg:block text-[8px] uppercase tracking-[0.22em] text-[#B9B49C]`}>
                    agr-1 · council 3/3 · conf 92
                  </span>
                </div>
              </article>

              {/* Card 2 */}
              <article className="border border-[#16233B]/20 bg-white p-5 shadow-[0_1px_0_#16233B]">
                <p className={`${mono.className} text-[8px] uppercase tracking-[0.28em] text-[#61708F]`}>
                  Exhibit B · Case PVG-2026-0115
                </p>
                <h3 className={`${fraunces.className} mt-2 text-[20px] font-semibold leading-snug text-[#16233B]`}>
                  Nimbus Tech — eligibility sweep <span className="italic font-medium text-[#61708F]">(7 students)</span>
                </h3>
                <p className="mt-1 text-[11px] text-[#3D4A63]">
                  <span className="font-semibold text-[#1E6F4C]">3 cleared</span> · rule v3 · be-track
                </p>
                <ul className="mt-2">
                  {s.queue[1].blocked?.map((b) => (
                    <li key={b} className="flex items-baseline gap-3 border-t border-[#16233B]/10 py-2 text-[10px] text-[#8E2A2B]">
                      <span className={`${mono.className} shrink-0 text-[8px] uppercase text-[#B08D2E]`}>Barred</span>
                      <span className={mono.className}>{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button className="bg-[#16233B] px-6 py-2.5 text-[12px] font-semibold text-[#FBFAF6] hover:bg-[#1F3050]">
                    Seal &amp; sign
                  </button>
                  <button className="border border-[#8E2A2B] px-5 py-2.5 text-[12px] font-semibold text-[#8E2A2B] hover:bg-[#8E2A2B] hover:text-[#FBFAF6]">
                    Override — enter reason
                  </button>
                  <button className="px-4 py-2.5 text-[12px] text-[#61708F] underline decoration-[#C9C6B8] underline-offset-4 hover:text-[#16233B]">
                    Hold
                  </button>
                </div>
              </article>

              {/* Card 3 */}
              <article className="border border-[#16233B]/20 bg-white p-5 shadow-[0_1px_0_#16233B]">
                <p className={`${mono.className} text-[8px] uppercase tracking-[0.28em] text-[#61708F]`}>
                  Exhibit C · Case PVG-2026-0116
                </p>
                <h3 className={`${fraunces.className} mt-2 text-[20px] font-semibold leading-snug text-[#16233B]`}>
                  Schedule — two slots, Thu 14:00 / Fri 10:00
                </h3>
                <div className="mt-2 border-l-2 border-[#8E2A2B] bg-[#FBF3F0] px-3 py-2 text-[11px] text-[#8E2A2B]">
                  <span className={`${mono.className} text-[8px] uppercase tracking-[0.2em]`}>Conflict — </span>
                  Zen Financial occupies Fri 10:00
                </div>
                <p className="mt-2 text-[11px] text-[#1E6F4C]">
                  <span className={`${mono.className} text-[8px] uppercase tracking-[0.2em]`}>Remedy — </span>
                  Move Nimbus to Fri 14:00 · zero clashes, panel free
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button className="bg-[#16233B] px-6 py-2.5 text-[12px] font-semibold text-[#FBFAF6] hover:bg-[#1F3050]">
                    Seal &amp; sign
                  </button>
                  <button className="border border-[#8E2A2B] px-5 py-2.5 text-[12px] font-semibold text-[#8E2A2B] hover:bg-[#8E2A2B] hover:text-[#FBFAF6]">
                    Override — enter reason
                  </button>
                  <button className="px-4 py-2.5 text-[12px] text-[#61708F] underline decoration-[#C9C6B8] underline-offset-4 hover:text-[#16233B]">
                    Hold
                  </button>
                </div>
              </article>
            </section>

            {/* right rail — annexures */}
            <section aria-label="Evidence annexures" className="xl:col-span-4 space-y-4">
              <div className="border border-[#16233B]/20 bg-[#FFFFFF] p-5">
                <div className="flex items-baseline justify-between border-b border-[#16233B]/12 pb-2">
                  <h2 className={`${mono.className} text-[8px] uppercase tracking-[0.3em] text-[#61708F]`}>
                    Annexure A — Cohort proficiency
                  </h2>
                  <span className={`${mono.className} text-[8px] text-[#B9B49C]`}>% ≥ 75</span>
                </div>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full border-collapse text-center">
                    <thead>
                      <tr>
                        <th />
                        {s.heatCohorts.map((c) => (
                          <th key={c} className={`${mono.className} pb-1 text-[9px] font-medium text-[#61708F]`}>{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {s.heatSkills.map((skill, i) => (
                        <tr key={skill}>
                          <th className="py-[3px] pr-2 text-left text-[10px] font-normal text-[#3D4A63]">
                            {skill}
                          </th>
                          {s.heat[i].map((v, j) => (
                            <td key={j} className="p-[2px]">
                              <span
                                className={`grid h-6 w-full min-w-8 place-items-center text-[8px] ${mono.className} ${v >= 3 ? "text-[#FBFAF6]" : "text-[#61708F]"}`}
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
                <p className="mt-3 border-t border-dashed border-[#16233B]/20 pt-2 text-[10px] leading-snug text-[#3D4A63]">
                  <span className="font-semibold text-[#16233B]">SQL joins — 41% below bar</span> in BE
                  &amp; CE; the issued set tilts toward joins for this reason.
                </p>
              </div>

              <div className="border border-[#1E6F4C]/30 bg-[#F4FAF6] p-5">
                <p className={`${mono.className} text-[8px] uppercase tracking-[0.3em] text-[#1E6F4C]`}>
                  Annexure B — Fairness certificate
                </p>
                <p className={`${fraunces.className} mt-2 text-[18px] font-semibold leading-snug text-[#14452E]`}>
                  No cohort is favoured.
                </p>
                <p className={`${mono.className} mt-1 text-[8px] uppercase tracking-[0.18em] text-[#1E6F4C]/80`}>
                  Parity 0.91 · χ² p = 0.44 · n = 7
                </p>
              </div>

              <div className="border border-[#16233B]/12 p-5">
                <h2 className={`${mono.className} text-[8px] uppercase tracking-[0.3em] text-[#61708F]`}>
                  Annexure C — Protocol
                </h2>
                <ol className="mt-2 space-y-1.5 text-[10px] leading-snug text-[#3D4A63]">
                  <li className="flex gap-2"><span className="font-semibold text-[#B08D2E]">I.</span>The register is append-only; corrections are new entries.</li>
                  <li className="flex gap-2"><span className="font-semibold text-[#B08D2E]">II.</span>Overrides record a reason, min. 8 characters, countersigned weekly.</li>
                  <li className="flex gap-2"><span className="font-semibold text-[#B08D2E]">III.</span>Exports bear the NAAC / NIRF verification seal.</li>
                </ol>
                <p className={`${mono.className} mt-3 border-t border-[#16233B]/12 pt-2 text-[7px] uppercase leading-relaxed tracking-[0.18em] text-[#B9B49C]`}>
                  Printed from Pravega · verify at pravega.vppcoe.edu/seal
                </p>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
