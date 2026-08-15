use serde::Deserialize;
use tauri::State;

use crate::apply;
use crate::autostart;
use crate::config;
use crate::sysfs;
use crate::telemetry::{Sample, TelemetryState};

#[tauri::command]
pub fn get_state() -> serde_json::Value {
    serde_json::json!({
        "driver": sysfs::driver(),
        "governor": sysfs::governor(),
        "no_turbo": sysfs::no_turbo(),
        "max_perf_pct": sysfs::max_perf_pct(),
        "min_perf_pct": sysfs::min_perf_pct(),
        "turbo_pct": sysfs::turbo_pct(),
        "base_freq_khz": sysfs::base_freq_khz(),
        "min_freq_khz": sysfs::min_freq_khz(),
        "turbo_max_khz": sysfs::turbo_max_khz(),
        "epp_prefs": sysfs::epp_prefs(),
        "epp": sysfs::epp(),
        "ncpus": sysfs::ncpus(),
    })
}

#[tauri::command]
pub fn get_telemetry(state: State<'_, TelemetryState>) -> Option<Sample> {
    state.last.lock().unwrap().clone()
}

#[derive(Deserialize)]
pub struct ApplyArgs {
    pub turbo_on: bool,
    pub max_perf_pct: u32,
    pub min_perf_pct: u32,
    #[serde(default)]
    pub epp: Option<String>,
}

#[tauri::command]
pub async fn apply_settings(args: ApplyArgs) -> Result<String, String> {
    tauri::async_runtime::spawn_blocking(move || {
        apply::apply(
            args.turbo_on,
            args.max_perf_pct,
            args.min_perf_pct,
            args.epp,
        )
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
pub fn save_profile(profile: config::Profile) -> Result<(), String> {
    config::save(&profile)
}

#[tauri::command]
pub fn load_profile() -> config::Profile {
    config::load()
}

#[tauri::command]
pub fn get_autostart() -> bool {
    autostart::enabled()
}

#[tauri::command]
pub fn set_autostart(enabled: bool) -> Result<(), String> {
    autostart::set(enabled)
}
