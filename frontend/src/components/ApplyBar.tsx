import { FloppyDisk, Play } from "@phosphor-icons/react";
import StatusPill, { type StatusKind } from "./StatusPill";
import Toggle from "./Toggle";

interface ApplyBarProps {
  busy: boolean;
  kind: StatusKind;
  message?: string;
  onApply: () => void;
  onSave: () => void;
  autostart: boolean;
  onToggleAutostart: (v: boolean) => void;
  autostartBusy: boolean;
}

export default function ApplyBar({
  busy,
  kind,
  message,
  onApply,
  onSave,
  autostart,
  onToggleAutostart,
  autostartBusy,
}: ApplyBarProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <button
          type="button"
          onClick={onApply}
          disabled={busy}
          className="flex items-center justify-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold leading-none text-bg transition-transform duration-100 active:scale-[0.97] disabled:opacity-50"
        >
          <Play size={14} weight="fill" className="shrink-0" />
          {busy ? "Applying…" : "Apply"}
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={busy}
          title="Save profile"
          className="flex items-center justify-center gap-2 rounded-full border border-hairline2 bg-surface2 px-3 py-2 text-sm font-medium text-muted transition-colors duration-150 hover:text-text active:scale-[0.97] disabled:opacity-50"
        >
          <FloppyDisk size={14} />
        </button>
      </div>
      <StatusPill kind={kind} message={message} />
      <div className="mt-1 border-t border-hairline2 pt-3">
        <Toggle
          checked={autostart}
          onChange={onToggleAutostart}
          label="Start on login"
          hint="Launch with your GNOME session"
          disabled={autostartBusy}
        />
      </div>
    </div>
  );
}