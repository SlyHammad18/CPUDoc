import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export interface CpuState {
  driver: string | null;
  governor: string | null;
  no_turbo: boolean | null;
  max_perf_pct: number | null;
  min_perf_pct: number | null;
  turbo_pct: number | null;
  base_freq_khz: number | null;
  min_freq_khz: number | null;
  turbo_max_khz: number | null;
  epp_prefs: string[];
  epp: string | null;
  ncpus: number;
  cpu_model: string | null;
}

export interface Power {
  package: number | null;
  cores: number | null;
  uncore: number | null;
  dram: number | null;
}

export interface TelemetrySample {
  package_temp: number | null;
  core_temps: number[];
  cpu_freqs: number[];
  cpu_usage: number[];
  total_usage: number;
  power: Power;
}

export interface Profile {
  turbo_enabled: boolean;
  max_perf_pct: number;
  min_perf_pct: number;
  epp: string | null;
}

export interface ApplyArgs {
  turbo_on: boolean;
  max_perf_pct: number;
  min_perf_pct: number;
  epp?: string | null;
}

export function getState(): Promise<CpuState> {
  return invoke<CpuState>("get_state");
}

export function getTelemetry(): Promise<TelemetrySample | null> {
  return invoke<TelemetrySample | null>("get_telemetry");
}

export function applySettings(args: ApplyArgs): Promise<string> {
  return invoke<string>("apply_settings", { args });
}

export function saveProfile(profile: Profile): Promise<void> {
  return invoke<void>("save_profile", { profile });
}

export function loadProfile(): Promise<Profile> {
  return invoke<Profile>("load_profile");
}

export function getAutostart(): Promise<boolean> {
  return invoke<boolean>("get_autostart");
}

export function setAutostart(enabled: boolean): Promise<void> {
  return invoke<void>("set_autostart", { enabled });
}

export function onTelemetry(
  cb: (sample: TelemetrySample) => void,
): Promise<() => void> {
  return listen<TelemetrySample>("telemetry", (e) => cb(e.payload));
}
