import { tempColor } from "../theme";

export default function TempPanel({
  pkg,
  cores,
}: {
  pkg: number | null;
  cores: number[];
}) {
  return (
    <div className="flex items-center justify-between gap-5">
      <div className="min-w-[86px]">
        <div
          className="font-mono text-3xl leading-none"
          style={{ color: tempColor(pkg ?? 0) }}
        >
          {pkg != null ? pkg.toFixed(0) : "—"}
          <span className="ml-1 text-sm text-muted">°C</span>
        </div>
        <div className="mt-1 text-[9px] uppercase tracking-[0.18em] text-muted">
          Package temp
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {cores.map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 font-mono text-[11px] text-muted"
          >
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: tempColor(t) }}
            />
            C{i} <span className="text-text">{t.toFixed(0)}°</span>
          </div>
        ))}
      </div>
    </div>
  );
}