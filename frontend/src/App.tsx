import ControlPanel from "./components/ControlPanel";
import TelemetryPanel from "./components/TelemetryPanel";
import Titlebar from "./components/Titlebar";
import { useCpuState, useTelemetry } from "./lib/useTelemetry";
import { achievedCapKhz } from "./lib/cpu";

export default function App() {
  const { state, refresh } = useCpuState();
  const { sample, history } = useTelemetry();

  const turboMaxKhz = state?.turbo_max_khz ?? 3458000;
  const curKhz = sample ? Math.max(...sample.cpu_freqs, 0) : null;
  const capKhz = state
    ? achievedCapKhz(
        state.max_perf_pct ?? 100,
        state.turbo_max_khz ?? turboMaxKhz,
        state.no_turbo,
        state.base_freq_khz,
        state.min_freq_khz,
      )
    : null;

  return (
    <div className="flex h-full flex-col bg-bg text-text">
      <Titlebar state={state} />

      <div className="grid min-h-0 flex-1 grid-cols-[320px_1fr] gap-3 p-3">
        <ControlPanel
          turboMaxKhz={state?.turbo_max_khz ?? null}
          baseKhz={state?.base_freq_khz ?? null}
          minKhz={state?.min_freq_khz ?? null}
          eppPrefs={state?.epp_prefs ?? []}
          noTurbo={state?.no_turbo ?? null}
          currentEpp={state?.epp ?? null}
          currentKhz={curKhz}
          onApplied={refresh}
        />
        <TelemetryPanel
          sample={sample}
          history={history}
          turboMaxKhz={turboMaxKhz}
          capKhz={capKhz}
        />
      </div>
    </div>
  );
}