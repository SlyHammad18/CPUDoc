import { clamp } from "../theme";

const CX = 120;
const CY = 93;
const R = 63;

function polar(deg: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [CX + R * Math.cos(a), CY + R * Math.sin(a)];
}

function arcPath(fromDeg: number, toDeg: number): string {
  const [x1, y1] = polar(fromDeg);
  const [x2, y2] = polar(toDeg);
  let sweep = (toDeg - fromDeg) % 360;
  if (sweep <= 0) sweep += 360;
  const large = sweep > 180 ? 1 : 0;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

const TRACK = arcPath(135, 45);
const TICKS = [0, 0.25, 0.5, 0.75, 1].map((f) => {
  const ang = (135 + f * 270) % 360;
  const a = (ang * Math.PI) / 180;
  const inner = [CX + (R - 5) * Math.cos(a), CY + (R - 5) * Math.sin(a)];
  const outer = [CX + (R - 10) * Math.cos(a), CY + (R - 10) * Math.sin(a)];
  return { inner, outer };
});

export default function FreqGauge({
  curKhz,
  turboMaxKhz,
}: {
  curKhz: number;
  turboMaxKhz: number;
}) {
  const frac = clamp(curKhz / Math.max(turboMaxKhz, 1), 0, 1);
  const valuePath = frac > 0.001 ? arcPath(135, 135 + frac * 270) : null;
  const needleAngle = ((135 + frac * 270) % 360) - 270;
  const ghz = (curKhz / 1e6).toFixed(2);
  const cap = (turboMaxKhz / 1e6).toFixed(2);

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 240 150" className="w-full max-w-[300px]">
        <path d={TRACK} fill="none" stroke="#1E2530" strokeWidth={7} strokeLinecap="round" />
        {valuePath && (
          <path
            d={valuePath}
            fill="none"
            stroke="#E8A33D"
            strokeWidth={7}
            strokeLinecap="round"
            style={{ transition: "d 0.8s cubic-bezier(0.16,1,0.3,1)" }}
          />
        )}
        {TICKS.map((t, i) => (
          <line
            key={i}
            x1={t.inner[0]}
            y1={t.inner[1]}
            x2={t.outer[0]}
            y2={t.outer[1]}
            stroke="#232B38"
            strokeWidth={1.5}
          />
        ))}
        <g
          style={{
            transform: `rotate(${needleAngle}deg)`,
            transformOrigin: `${CX}px ${CY}px`,
            transformBox: "view-box",
            transition: "transform 0.8s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <line
            x1={CX}
            y1={CY}
            x2={CX}
            y2={CY - 46}
            stroke="#E6EAF0"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        </g>
        <circle cx={CX} cy={CY} r={7} fill="#12161D" stroke="#E8A33D" strokeWidth={2} />
      </svg>
      <div className="-mt-2 flex items-baseline gap-2 font-mono">
        <span className="text-2xl leading-none text-text">{ghz}</span>
        <span className="text-[10px] uppercase tracking-widest text-muted">
          of {cap} GHz
        </span>
      </div>
    </div>
  );
}