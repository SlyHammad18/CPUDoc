import { useEffect, useRef, useState } from "react";
import type { Profile } from "../lib/api";
import {
  applySettings,
  getAutostart,
  loadProfile,
  saveProfile,
  setAutostart,
} from "../lib/api";
import type { StatusKind } from "./StatusPill";
import ApplyBar from "./ApplyBar";
import ClockSlider from "./ClockSlider";
import EppSelect from "./EppSelect";
import Toggle from "./Toggle";
import { clamp } from "../theme";

const DEFAULT_PROFILE: Profile = {
  turbo_enabled: true,
  max_perf_pct: 100,
  min_perf_pct: 22,
  epp: null,
};

interface ControlPanelProps {
  turboMaxKhz: number | null;
  minKhz: number | null;
  eppPrefs: string[];
  noTurbo: boolean | null;
  currentEpp: string | null;
  onApplied: () => void;
}

export default function ControlPanel({
  turboMaxKhz,
  minKhz,
  eppPrefs,
  noTurbo,
  currentEpp,
  onApplied,
}: ControlPanelProps) {
  const turboMax = turboMaxKhz ? Math.round(turboMaxKhz / 1000) : 3458;
  const minMhz = minKhz ? Math.round(minKhz / 1000) : 800;

  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [mhz, setMhz] = useState(2600);
  const [busy, setBusy] = useState(false);
  const [kind, setKind] = useState<StatusKind>("idle");
  const [message, setMessage] = useState<string | undefined>();
  const [autostart, setAutostartState] = useState(false);
  const [autostartBusy, setAutostartBusy] = useState(false);
  const synced = useRef(false);

  useEffect(() => {
    if (turboMaxKhz == null || synced.current) return;
    synced.current = true;
    loadProfile()
      .then((p) => {
        const isDefault =
          p.turbo_enabled === true &&
          p.max_perf_pct === 100 &&
          p.min_perf_pct === 22 &&
          p.epp == null;
        const seeded = isDefault
          ? {
              ...p,
              turbo_enabled: noTurbo == null ? p.turbo_enabled : !noTurbo,
              epp: currentEpp ?? p.epp,
            }
          : p;
        setProfile(seeded);
        setMhz(Math.round((seeded.max_perf_pct / 100) * turboMax));
      })
      .catch(() => {});
  }, [turboMaxKhz, turboMax, noTurbo, currentEpp]);

  function onMhz(v: number) {
    setMhz(v);
    setProfile((p) => ({
      ...p,
      max_perf_pct: clamp(Math.round((v / turboMax) * 100), 0, 100),
    }));
  }

  useEffect(() => {
    getAutostart().then(setAutostartState).catch(() => {});
  }, []);

  async function onToggleAutostart(v: boolean) {
    setAutostartBusy(true);
    try {
      await setAutostart(v);
      setAutostartState(v);
      setKind("applied");
      setMessage(v ? "Will start on login" : "Removed from login");
    } catch (e) {
      setKind("error");
      setMessage(String(e));
    } finally {
      setAutostartBusy(false);
    }
  }

  async function onApply() {
    setBusy(true);
    setKind("busy");
    setMessage("Applying…");
    try {
      await applySettings({
        turbo_on: profile.turbo_enabled,
        max_perf_pct: profile.max_perf_pct,
        min_perf_pct: profile.min_perf_pct,
        epp: profile.epp,
      });
      setKind("applied");
      setMessage("Applied");
      onApplied();
    } catch (e) {
      const msg = String(e);
      setKind("error");
      setMessage(
        /pkexec|polkit|permission|not installed/i.test(msg)
          ? "Needs root — run sudo ./install.sh"
          : msg,
      );
    } finally {
      setBusy(false);
    }
  }

  async function onSave() {
    try {
      await saveProfile(profile);
      setKind("applied");
      setMessage("Saved");
    } catch (e) {
      setKind("error");
      setMessage(String(e));
    }
  }

  const turboNow = noTurbo != null ? (noTurbo ? "off" : "on") : undefined;

  return (
    <div className="flex min-h-0 flex-col gap-3">
      <section className="rounded-xl border border-hairline bg-surface p-4">
        <div className="mb-3 text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
          Turbo boost
        </div>
        <Toggle
          checked={profile.turbo_enabled}
          onChange={(v) => setProfile((p) => ({ ...p, turbo_enabled: v }))}
          label="Turbo boost"
          hint={turboNow ? `now: ${turboNow}` : "enables all-core boost"}
        />
      </section>

      <section className="rounded-xl border border-hairline bg-surface p-4">
        <div className="mb-3 text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
          Clock cap
        </div>
        <ClockSlider
          mhz={mhz}
          minMhz={minMhz}
          maxMhz={turboMax}
          onChange={onMhz}
        />
      </section>

      {eppPrefs.length ? (
        <section className="rounded-xl border border-hairline bg-surface p-4">
          <EppSelect
            prefs={eppPrefs}
            value={profile.epp}
            onChange={(v) => setProfile((p) => ({ ...p, epp: v }))}
          />
        </section>
      ) : null}

      <section className="rounded-xl border border-hairline bg-surface p-4">
        <ApplyBar
          busy={busy}
          kind={kind}
          message={message}
          onApply={onApply}
          onSave={onSave}
          autostart={autostart}
          onToggleAutostart={onToggleAutostart}
          autostartBusy={autostartBusy}
        />
      </section>
    </div>
  );
}