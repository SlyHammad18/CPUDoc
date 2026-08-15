import { clamp } from "../theme";

interface ClockSliderProps {
  mhz: number;
  minMhz: number;
  maxMhz: number;
  currentKhz?: number | null;
  onChange: (mhz: number) => void;
  disabled?: boolean;
}

export default function ClockSlider({
  mhz,
  minMhz,
  maxMhz,
  currentKhz,
  onChange,
  disabled,
}: ClockSliderProps) {
  const fill = clamp(((mhz - minMhz) / (maxMhz - minMhz)) * 100, 0, 100);
  const curPct = clamp(
    ((currentKhz ?? 0) / 1000 - minMhz) / (maxMhz - minMhz) * 100,
    0,
    100,
  );
  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <div className="font-mono text-2xl leading-none text-text">
            {(mhz / 1000).toFixed(2)}
            <span className="ml-1 text-xs text-muted">GHz</span>
          </div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted">
            Max clock
          </div>
        </div>
        <div className="pr-1 text-right">
          <div className="font-mono text-sm text-accent">
            {Math.round((mhz / maxMhz) * 100)}%
          </div>
          <div className="font-mono text-[10px] text-muted">of turbo</div>
        </div>
      </div>
      <div className="relative mt-1">
        <input
          type="range"
          min={minMhz}
          max={maxMhz}
          step={50}
          value={mhz}
          disabled={disabled}
          style={{ ["--fill" as string]: `${fill}%` }}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label="Maximum clock speed"
        />
        {currentKhz != null && (
          <span
            className="pointer-events-none absolute top-1/2 h-3 w-[2px] -translate-y-1/2 rounded-full bg-muted/70"
            style={{ left: `calc(${curPct}% - 1px)` }}
            aria-hidden
          />
        )}
      </div>
      <div className="flex justify-between font-mono text-[11px] text-muted">
        <span>{(minMhz / 1000).toFixed(2)}</span>
        <span>{maxMhz >= 10000 ? Math.round(maxMhz / 1000) : (maxMhz / 1000).toFixed(2)}</span>
      </div>
    </div>
  );
}