import { SAMPLE } from "@/lib/design-lab/data";
import { jetbrainsMono } from "@/app/design-lab/monochrome/fonts";

const cellLabel = ["·", "25", "50", "75", "95"];

// Semantic table, single-hue ramp, screen-reader caption. Server-safe.
export function MonoHeatmap() {
  const s = SAMPLE;
  return (
    <div id="rail-heat" className="scroll-mt-4 rounded-[8px] border border-[var(--m-line)] bg-[var(--m-panel)] p-4">
      <div className="flex items-baseline justify-between">
        <h2 className={`${jetbrainsMono.className} text-[8px] uppercase tracking-[0.28em] text-[var(--m-ink-faint)]`}>
          Cohort heat · mock #4
        </h2>
        <span className={`${jetbrainsMono.className} text-[8px] text-[var(--m-ink-faint)]`}>fig. 1</span>
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-center">
          <caption className="sr-only">
            Percentage of each cohort at or above the 75-point bar, per skill. SQL joins: BE 75,
            CE 50, IT 95, ME 25 — weakest in BE and CE.
          </caption>
          <thead>
            <tr>
              <th scope="col" className="pb-1.5 text-left">
                <span className="sr-only">Skill</span>
              </th>
              {s.heatCohorts.map((c) => (
                <th
                  key={c}
                  scope="col"
                  className={`${jetbrainsMono.className} pb-1.5 text-[9px] font-medium text-[var(--m-ink-dim)]`}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {s.heatSkills.map((skill, i) => (
              <tr key={skill}>
                <th
                  scope="row"
                  className="py-[3px] pr-2 text-left text-[10px] font-normal text-[var(--m-ink-dim)]"
                >
                  {skill}
                </th>
                {s.heat[i].map((v, j) => (
                  <td key={j} className="p-[2px]">
                    <span
                      className={`m-heat-${v + 1} grid h-6 w-full min-w-8 place-items-center rounded-[3px] text-[8px] ${jetbrainsMono.className}`}
                      title={`${skill} · ${s.heatCohorts[j]}: ${cellLabel[v] === "·" ? "no attempt" : `${cellLabel[v]}% at/above bar`}`}
                    >
                      {cellLabel[v]}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 border-t border-[var(--m-line)] pt-2 text-[10px] leading-snug text-[var(--m-ink-dim)]">
        <span className="font-semibold text-[var(--m-ink)]">SQL joins — 41% weak</span> across BE &amp; CE;
        agr-1 weighted the issued set toward joins.
      </p>
    </div>
  );
}
