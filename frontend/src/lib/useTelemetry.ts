import { useCallback, useEffect, useRef, useState } from "react";
import type { CpuState, TelemetrySample } from "./api";
import { getState, getTelemetry, onTelemetry } from "./api";

export const HISTORY = 60;

export interface History {
  usage: number[];
  freq: number[];
  power: number[];
  temp: number[];
}

function push(arr: number[], v: number): number[] {
  const next = arr.length >= HISTORY ? arr.slice(arr.length - HISTORY + 1) : arr;
  next.push(v);
  return next;
}

export function useTelemetry() {
  const [sample, setSample] = useState<TelemetrySample | null>(null);
  const [history, setHistory] = useState<History>({
    usage: [],
    freq: [],
    power: [],
    temp: [],
  });
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    getTelemetry()
      .then((s) => {
        if (mounted.current && s) setSample(s);
      })
      .catch(() => {});
    const off = onTelemetry((s) => {
      setSample(s);
      setHistory((h) => {
        const freq = s.cpu_freqs.length
          ? s.cpu_freqs.reduce((a, b) => a + b, 0) / s.cpu_freqs.length
          : 0;
        return {
          usage: push(h.usage, s.total_usage),
          freq: push(h.freq, freq),
          power: push(h.power, s.power.package ?? 0),
          temp: push(h.temp, s.package_temp ?? 0),
        };
      });
    });
    return () => {
      mounted.current = false;
      off.then((f) => f());
    };
  }, []);

  return { sample, history };
}

export function useCpuState() {
  const [state, setState] = useState<CpuState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(() => {
    getState()
      .then(setState)
      .catch((e) => setError(String(e)));
  }, []);
  useEffect(refresh, [refresh]);
  return { state, error, refresh };
}