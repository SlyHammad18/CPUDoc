import { useEffect, useState } from "react";
import { Gauge, Minus, Square, X } from "@phosphor-icons/react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import type { CpuState } from "../lib/api";
import { colors } from "../theme";

const appWindow = getCurrentWindow();

function LivePill() {
  return (
    <span className="hidden items-center gap-1.5 rounded-full border border-hairline bg-surface2 px-2.5 py-1 font-mono text-[10px] text-muted sm:flex">
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: colors.accent }}
      />
      live · 1s
    </span>
  );
}

function TurboPill({ noTurbo }: { noTurbo: boolean | null }) {
  if (noTurbo == null) return null;
  const on = !noTurbo;
  return (
    <span className="hidden items-center gap-1.5 rounded-full border border-hairline bg-surface2 px-2.5 py-1 font-mono text-[10px] md:flex">
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: on ? colors.accent : colors.muted }}
      />
      turbo {on ? "on" : "off"}
    </span>
  );
}

function TitlebarControl({
  label,
  onClick,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`flex h-8 w-9 items-center justify-center rounded-md text-muted transition-colors duration-100 ${
        danger
          ? "hover:bg-[rgba(232,75,61,0.14)] hover:text-[#E84B3D]"
          : "hover:bg-surface2 hover:text-text"
      } active:scale-90`}
    >
      {children}
    </button>
  );
}

export default function Titlebar({ state }: { state: CpuState | null }) {
  const [maxed, setMaxed] = useState(false);

  useEffect(() => {
    let un: (() => void) | undefined;
    appWindow
      .isMaximized()
      .then(setMaxed)
      .catch(() => {});
    appWindow
      .onResized(() => appWindow.isMaximized().then(setMaxed).catch(() => {}))
      .then((f) => {
        un = f;
      })
      .catch(() => {});
    return () => un?.();
  }, []);

  const model = state?.cpu_model?.replace(/\s*CPU\s*@\s*/, " · ");

  return (
    <header
      data-tauri-drag-region
      className="grid h-12 shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-hairline bg-surface px-3"
    >
      <div className="flex min-w-0 items-center gap-2.5 justify-self-start">
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-hairline bg-surface2"
          aria-hidden
        >
          <Gauge size={15} color={colors.accent} />
        </div>
        <div className="min-w-0 leading-tight">
          <div className="truncate text-[13px] font-semibold tracking-tight">
            CPUDoc
          </div>
          <div
            className="truncate font-mono text-[10px] text-muted"
            data-tauri-drag-region
          >
            {model ?? "connecting…"}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5" data-tauri-drag-region>
        <LivePill />
        <TurboPill noTurbo={state?.no_turbo ?? null} />
      </div>

      <div className="flex items-center gap-1 justify-self-end">
        <TitlebarControl label="Minimize" onClick={() => appWindow.minimize()}>
          <Minus size={14} weight="bold" />
        </TitlebarControl>
        <TitlebarControl
          label={maxed ? "Restore" : "Maximize"}
          onClick={() => appWindow.toggleMaximize()}
        >
          <Square size={12} weight="bold" />
        </TitlebarControl>
        <TitlebarControl label="Close" onClick={() => appWindow.close()} danger>
          <X size={14} weight="bold" />
        </TitlebarControl>
      </div>
    </header>
  );
}