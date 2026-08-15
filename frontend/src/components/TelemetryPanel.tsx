import type { History } from "../lib/useTelemetry";
import type { TelemetrySample } from "../lib/api";
import CoreBars from "./CoreBars";
import FreqGauge from "./FreqGauge";
import PowerPanel from "./PowerPanel";
import Skeleton from "./Skeleton";
import TempPanel from "./TempPanel";
import UsageRing from "./UsageRing";

interface TelemetryPanelProps {
  sample: TelemetrySample | null;
  history: History;
  turboMaxKhz: number;
}

export default function TelemetryPanel({
  sample,
  history,
  turboMaxKhz,
}: TelemetryPanelProps) {
  const noData = !sample;
  const curFreq = sample
    ? Math.max(...sample.cpu_freqs, 0)
    : 0;

  return (
    <div className="flex min-h-0 flex-col gap-3">
      <div className="grid min-h-0 grid-cols-[auto_1fr] gap-3">
        <section className="flex items-center justify-center rounded-xl border border-hairline bg-surface p-4">
          {noData ? (
            <Skeleton className="h-[120px] w-[120px] rounded-full" />
          ) : (
            <UsageRing pct={sample.total_usage} />
          )}
        </section>
        <section className="flex items-center justify-center rounded-xl border border-hairline bg-surface p-4">
          {noData ? (
            <Skeleton className="h-[120px] w-full" />
          ) : (
            <FreqGauge curKhz={curFreq} turboMaxKhz={turboMaxKhz} />
          )}
        </section>
      </div>

      <section className="rounded-xl border border-hairline bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
            Core load
          </span>
          <span className="font-mono text-[10px] text-muted">GHz</span>
        </div>
        {noData ? (
          <Skeleton className="h-[58px] w-full" />
        ) : (
          <CoreBars usage={sample.cpu_usage} freqs={sample.cpu_freqs} />
        )}
      </section>

      <div className="grid grid-cols-2 gap-3">
        <section className="rounded-xl border border-hairline bg-surface p-4">
          {noData ? (
            <Skeleton className="h-[64px] w-full" />
          ) : (
            <TempPanel pkg={sample.package_temp} cores={sample.core_temps} />
          )}
        </section>
        <section className="rounded-xl border border-hairline bg-surface p-4">
          {noData ? (
            <Skeleton className="h-[64px] w-full" />
          ) : (
            <PowerPanel power={sample.power} history={history.power} />
          )}
        </section>
      </div>
    </div>
  );
}