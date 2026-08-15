import { useEffect, useState } from "react";
import type { CpuState, Profile, TelemetrySample } from "./lib/api";
import {
  applySettings,
  getState,
  getTelemetry,
  loadProfile,
  onTelemetry,
  saveProfile,
} from "./lib/api";

const DEFAULT_PROFILE: Profile = {
  turbo_enabled: true,
  max_perf_pct: 100,
  min_perf_pct: 22,
  epp: null,
};

function fmtW(w: number | null): string {
  return w == null ? "—" : w.toFixed(1);
}

export default function App() {
  const [state, setState] = useState<CpuState | null>(null);
  const [tel, setTel] = useState<TelemetrySample | null>(null);
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    getState().then(setState).catch((e) => setMessage(String(e)));
    getTelemetry().then(setTel).catch(() => {});
    loadProfile().then(setProfile).catch(() => {});
    const off = onTelemetry(setTel);
    return () => {
      off.then((f) => f());
    };
  }, []);

  async function onApply() {
    setBusy(true);
    setMessage(null);
    try {
      await applySettings({
        turbo_on: profile.turbo_enabled,
        max_perf_pct: profile.max_perf_pct,
        min_perf_pct: profile.min_perf_pct,
        epp: profile.epp,
      });
      setMessage("Applied");
      setState(await getState());
    } catch (e) {
      setMessage(String(e));
    } finally {
      setBusy(false);
    }
  }

  async function onSave() {
    try {
      await saveProfile(profile);
      setMessage("Profile saved");
    } catch (e) {
      setMessage(String(e));
    }
  }

  const curMax = state?.turbo_max_khz ?? state?.base_freq_khz;

  return (
    <main style={{ padding: 24 }}>
      <h1>CPUDoc</h1>
      <p style={{ color: "#8A94A6" }}>
        {state?.driver ?? "…"} · {state?.governor ?? "…"} ·{" "}
        {state?.ncpus ?? 0} CPUs
      </p>

      <section
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
      >
        <div
          style={{
            background: "#12161D",
            border: "1px solid #1E2530",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <h3>Control</h3>
          <label style={{ display: "block", marginBottom: 8 }}>
            <input
              type="checkbox"
              checked={profile.turbo_enabled}
              onChange={(e) =>
                setProfile({ ...profile, turbo_enabled: e.target.checked })
              }
            />{" "}
            Turbo boost
          </label>
          <label style={{ display: "block", marginBottom: 8 }}>
            Max clock: {curMax ? Math.round(curMax / 1000) : "…"} MHz
          </label>
          <input
            type="range"
            min={10}
            max={100}
            value={profile.max_perf_pct}
            onChange={(e) =>
              setProfile({ ...profile, max_perf_pct: Number(e.target.value) })
            }
            style={{ width: "100%" }}
          />
          {state?.epp_prefs.length ? (
            <label style={{ display: "block", marginTop: 8 }}>
              Energy pref:{" "}
              <select
                value={profile.epp ?? ""}
                onChange={(e) =>
                  setProfile({ ...profile, epp: e.target.value || null })
                }
              >
                <option value="">—</option>
                {state.epp_prefs.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={onApply} disabled={busy}>
              {busy ? "Applying…" : "Apply"}
            </button>
            <button onClick={onSave}>Save profile</button>
          </div>
          {message ? <p style={{ color: "#8A94A6" }}>{message}</p> : null}
        </div>

        <div
          style={{
            background: "#12161D",
            border: "1px solid #1E2530",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <h3>Live</h3>
          <p className="mono">
            Total: {tel?.total_usage != null ? tel.total_usage.toFixed(0) : "—"}
            %
          </p>
          <p className="mono">
            Temp:{" "}
            {tel?.package_temp != null ? tel.package_temp.toFixed(0) : "—"}°C
          </p>
          <p className="mono">Power: {fmtW(tel?.power.package ?? null)} W</p>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            {tel?.cpu_usage.map((u, i) => (
              <div
                key={i}
                style={{
                  width: 12,
                  height: 80,
                  background: "#1E2530",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: `${u}%`,
                    background: "#E8A33D",
                    borderRadius: 3,
                    transition: "height 0.6s",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}