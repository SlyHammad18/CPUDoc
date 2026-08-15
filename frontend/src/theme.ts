export const colors = {
  bg: "#0B0E14",
  surface: "#12161D",
  surface2: "#171C26",
  hairline: "#1E2530",
  hairline2: "#232B38",
  text: "#E6EAF0",
  muted: "#99A2B4",
  accent: "#E8A33D",
  accentDim: "#B07E2C",
  warm: "#E8703D",
  hot: "#E84B3D",
};

export const radius = {
  sm: 8,
  md: 12,
  pill: 999,
};

export const ease = [0.16, 1, 0.3, 1];

export function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

export function tempColor(t: number): string {
  if (t >= 85) return colors.hot;
  if (t >= 70) return colors.warm;
  if (t >= 55) return colors.accent;
  return colors.muted;
}
