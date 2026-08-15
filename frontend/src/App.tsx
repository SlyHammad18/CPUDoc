import { Gauge } from "@phosphor-icons/react";
import { colors } from "./theme";
import ControlPanel from "./components/ControlPanel";
import TelemetryPanel from "./components/TelemetryPanel";
import { useCpuState, useTelemetry } from "./lib/useTelemetry";

export default function App() {
  const { state, refresh } = useCpuState();
  const { sample, history } = useTelemetry();

  const turboMaxKhz = state?.turbo_max_khz ?? 3458000;

  return (
    <div className="flex h-full flex-col bg-bg text-text">
      <header className="flex items-center justify-between border-b border-hairline px-5 py-3">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-hairline bg-surface"
            aria-hidden
          >
            <Gauge size={17} color={colors.accent} />
          </div>
          <div>
            <div className="text-sm font-semibold leading-tight tracking-tight">
              CPUDoc
            </div>
            <div className="font-mono text-[10px] leading-tight text-muted">
              {state
                ? `${state.driver ?? "—"} · ${state.governor ?? "—"} · ${state.ncpus ?? 0} CPUs`
                : "connecting…"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-muted">
          <span className="hidden items-center gap-1.5 sm:flex">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: colors.accent }}
            />
            live · 1s
          </span>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[320px_1fr] gap-3 p-3">
        <ControlPanel
          turboMaxKhz={state?.turbo_max_khz ?? null}
          minKhz={state?.min_freq_khz ?? null}
          eppPrefs={state?.epp_prefs ?? []}
          noTurbo={state?.no_turbo ?? null}
          currentEpp={state?.epp ?? null}
          onApplied={refresh}
        />
        <TelemetryPanel
          sample={sample}
          history={history}
          turboMaxKhz={turboMaxKhz}
        />
      </div>
    </div>
  );
}