import { Check, CircleNotch, WarningCircle } from "@phosphor-icons/react";

export type StatusKind = "idle" | "applied" | "error" | "busy";

export default function StatusPill({
  kind,
  message,
}: {
  kind: StatusKind;
  message?: string;
}) {
  if (kind === "idle" && !message) return null;
  const styles: Record<StatusKind, { color: string; bg: string; Icon: typeof Check }> = {
    idle: { color: "#E6EAF0", bg: "#171C26", Icon: Check },
    applied: { color: "#2DD4A8", bg: "rgba(45,212,168,0.12)", Icon: Check },
    error: { color: "#E84B3D", bg: "rgba(232,75,61,0.12)", Icon: WarningCircle },
    busy: { color: "#E6EAF0", bg: "#171C26", Icon: CircleNotch },
  };
  const { color, bg, Icon } = styles[kind];
  return (
    <div
      role="status"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 10px",
        borderRadius: 999,
        background: bg,
        color,
        fontSize: 12,
        lineHeight: 1,
      }}
    >
      <Icon
        size={13}
        weight="bold"
        className={kind === "busy" ? "animate-spin" : ""}
      />
      <span className="font-mono">{message ?? "…"}</span>
    </div>
  );
}