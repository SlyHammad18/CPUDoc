import { colors } from "../theme";

export default function CoreBars({
  usage,
  freqs,
}: {
  usage: number[];
  freqs: number[];
}) {
  return (
    <div className="flex gap-2">
      {usage.map((u, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
          <div className="flex h-[64px] w-full items-end overflow-hidden rounded-md bg-surface2">
            <div
              className="w-full rounded-t-[3px]"
              style={{
                height: `${Math.max(2, u)}%`,
                background: colors.accent,
                opacity: 0.3 + 0.7 * (u / 100),
                transition:
                  "height 0.6s cubic-bezier(0.16,1,0.3,1), opacity 0.6s",
              }}
            />
          </div>
          <div className="flex flex-col items-center gap-0.5 leading-none">
            <span className="font-mono text-[10px] text-muted">C{i}</span>
            <span className="font-mono text-[10px] text-text/70">
              {freqs[i] ? (freqs[i] / 1e6).toFixed(2) : "—"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}