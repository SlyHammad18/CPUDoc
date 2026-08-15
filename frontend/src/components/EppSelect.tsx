interface EppSelectProps {
  prefs: string[];
  value: string | null;
  onChange: (v: string | null) => void;
}

const EPP_LABELS: Record<string, string> = {
  performance: "Perf",
  balance_performance: "Balance",
  balance_power: "Power",
  power: "Eco",
};

export default function EppSelect({
  prefs,
  value,
  onChange,
}: EppSelectProps) {
  if (!prefs.length) return null;
  return (
    <div>
      <div className="mb-2 text-xs font-medium uppercase tracking-widest text-muted">
        Energy profile
      </div>
      <div
        className="grid gap-1 rounded-lg bg-bg p-1"
        style={{ gridTemplateColumns: `repeat(${prefs.length}, 1fr)` }}
        role="radiogroup"
        aria-label="Energy performance preference"
      >
        {prefs.map((p) => {
          const active = value === p;
          return (
            <button
              key={p}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(p)}
              className={`rounded-md px-1 py-1.5 text-center font-mono text-[11px] transition-colors duration-150 ${
                active
                  ? "bg-accent text-bg font-semibold"
                  : "text-muted hover:text-text"
              }`}
            >
              {EPP_LABELS[p] ?? p}
            </button>
          );
        })}
      </div>
    </div>
  );
}