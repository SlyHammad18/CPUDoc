import { clamp } from "../theme";

export function achievedCapKhz(
  pct: number,
  turboMaxKhz: number,
  noTurbo: boolean | null,
  baseKhz: number | null,
  minKhz: number | null,
): number {
  const tm = turboMaxKhz || 3458000;
  const raw = Math.ceil((clamp(pct, 0, 100) / 100) * tm / 100000) * 100000;
  const max = noTurbo ? baseKhz ?? tm : tm;
  const min = minKhz ?? 800000;
  return clamp(raw, min, max);
}