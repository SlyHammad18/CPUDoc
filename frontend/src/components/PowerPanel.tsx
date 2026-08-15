import type { Power } from "../lib/api";
import Sparkline from "./Sparkline";

export default function PowerPanel({
  power,
  history,
}: {
  power: Power;
  history: number[];
}) {
  const subs: [string, number | null][] = [
    ["Cores", power.cores],
    ["Uncore", power.uncore],
    ["DRAM", power.dram],
  ];
  return (
    <div className="flex flex-col">
      <div className="flex items-end justify-between">
        <div>
          <div className="font-mono text-3xl leading-none text-accent">
            {power.package != null ? power.package.toFixed(1) : "—"}
            <span className="ml-1 text-sm text-muted">W</span>
          </div>
          <div className="mt-1 text-[9px] uppercase tracking-[0.18em] text-muted">
            Package power
          </div>
        </div>
        <div className="space-y-0.5 text-right font-mono text-[11px] text-muted">
          {subs.map(([label, v]) => (
            <div key={label}>
              {label}{" "}
              <span className={v != null ? "text-text" : ""}>
                {v != null ? v.toFixed(1) : "—"}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2">
        <Sparkline data={history} width={300} height={32} />
      </div>
    </div>
  );
}