import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

interface SparklineProps {
  data: number[];
  width: number;
  height: number;
  color?: string;
}

export default function Sparkline({
  data,
  width,
  height,
  color = "var(--color-accent)",
}: SparklineProps) {
  const reduce = useReducedMotion();
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    if (!reduce) setDrawn(true);
  }, [reduce]);

  const n = data.length;
  const pts: string[] = [];
  if (n >= 2) {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const span = max - min || 1;
    const pad = 2;
    data.forEach((v, i) => {
      const x = pad + (i / (n - 1)) * (width - pad * 2);
      const y = pad + (1 - (v - min) / span) * (height - pad * 2);
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    });
  }

  if (pts.length < 2) {
    return (
      <svg width={width} height={height}>
        <line
          x1={0}
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="#1E2530"
          strokeWidth={1}
        />
      </svg>
    );
  }

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={0.9}
      />
      {!reduce && (
        <motion.polyline
          points={pts.join(" ")}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity={0.4}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: drawn ? 1 : 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ strokeDasharray: "1 0" }}
        />
      )}
    </svg>
  );
}