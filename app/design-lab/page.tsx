import Link from "next/link";

export const metadata = { title: "Pravega — Design Direction Candidates" };

const variants = [
  {
    n: "01",
    href: "/design-lab/mercury",
    name: "Private Ledger",
    refs: "Mercury · Ramp · Brex",
    feel: "Warm paper, deep green + brass, serif numerals. Private-bank calm — the \u201cdefend every decision\u201d pick.",
  },
  {
    n: "02",
    href: "/design-lab/linear",
    name: "Mission Control",
    refs: "Linear · Vercel · Raycast",
    feel: "Near-black, indigo telemetry, mono data. Dark-room projector favourite — maximum \u201cbuilt by operators\u201d energy.",
  },
  {
    n: "03",
    href: "/design-lab/stripe",
    name: "Executive SaaS",
    refs: "Stripe Dashboard",
    feel: "White + blurple, layered soft shadows. The safest pair of hands — reads as a shipped, serious product.",
  },
  {
    n: "04",
    href: "/design-lab/attio",
    name: "AI-Native Soft",
    refs: "Attio · Clay",
    feel: "Warm mesh gradients, pill controls, serif-italic accents. 2026 agentic-startup polish — the most contemporary.",
  },
  {
    n: "05",
    href: "/design-lab/credential",
    name: "Verifying Authority",
    refs: "DigiLocker × Editorial · RBI/SEBI annual reports",
    feel: "Archival paper, navy + crimson + brass, serif display. \u201cThe evidence is official.\u201d Most distinctive — the memorable one.",
  },
  {
    n: "06",
    href: "/design-lab/monochrome",
    name: "The Quiet Ledger",
    refs: "Obsidian · Vercel Geist · shadcn/Radix",
    feel: "Single-hue near-black, hairline rules, mono data — one violet kept for the verified seal. The calm pick.",
  },
];

export default function DesignLabIndex() {
  return (
    <main className="min-h-screen bg-[#111214] text-[#E8E6DF] px-6 py-12 md:px-16">
      <div className="max-w-4xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#8f8d84]">
          Pravega · Design Lab
        </p>
        <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight leading-[1.05]">
          Pick the face of
          <br />
          the verifying machine<span className="text-[#C9A961]">.</span>
        </h1>
        <p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-[#A9A79D]">
          Six directions, one screen — the T&amp;P officer Decision Queue with the same
          data in every variant. Built with real code (React + Tailwind + self-hosted
          fonts), not mockups. Open each, judge at arm&apos;s length, then choose.
        </p>
        <ol className="mt-10 divide-y divide-white/10 border-y border-white/10">
          {variants.map((v) => (
            <li key={v.n}>
              <Link
                href={v.href}
                className="group grid grid-cols-[3rem_1fr_auto] items-baseline gap-4 py-5 md:grid-cols-[4rem_1.1fr_2fr_auto] md:gap-8"
              >
                <span className="font-mono text-xs text-[#6f6d64]">{v.n}</span>
                <span>
                  <span className="block text-xl font-semibold tracking-tight text-[#F2F0E8] group-hover:text-white">
                    {v.name}
                  </span>
                  <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-[#8f8d84]">
                    {v.refs}
                  </span>
                </span>
                <span className="hidden text-[13px] leading-snug text-[#A9A79D] md:block">
                  {v.feel}
                </span>
                <span
                  aria-hidden
                  className="font-mono text-sm text-[#C9A961] transition-transform duration-200 group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ol>
        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-[#6f6d64]">
          Same data · same layout logic · five visual languages
        </p>
      </div>
    </main>
  );
}
