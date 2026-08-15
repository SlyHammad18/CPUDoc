export default function UsageRing({
  pct,
  size = 192,
}: {
  pct: number | null;
  size?: number;
}) {
  const r = size * 0.45;
  const sw = Math.max(7, size * 0.058);
  const c = 2 * Math.PI * r;
  const val = pct ?? 0;
  const off = c * (1 - val / 100);
  const eased = off; // CSS transition handles the motion
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#1E2530"
          strokeWidth={sw}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={eased}
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-mono text-2xl leading-none text-text">
          {val.toFixed(0)}
          <span className="ml-0.5 text-xs text-muted">%</span>
        </div>
        <div className="mt-1 text-[9px] uppercase tracking-[0.18em] text-muted">
          CPU load
        </div>
      </div>
    </div>
  );
}