use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(default)]
pub struct Profile {
    pub turbo_enabled: bool,
    pub max_perf_pct: u32,
    pub min_perf_pct: u32,
    pub epp: Option<String>,
}

impl Default for Profile {
    fn default() -> Self {
        Self {
            turbo_enabled: true,
            max_perf_pct: 100,
            min_perf_pct: 22,
            epp: None,
        }
    }
}

fn config_path() -> PathBuf {
    let base = std::env::var("XDG_CONFIG_HOME")
        .map(PathBuf::from)
        .unwrap_or_else(|_| {
            std::env::var("HOME")
                .map(PathBuf::from)
                .unwrap_or_default()
                .join(".config")
        });
    base.join("cpudoc").join("config.json")
}

pub fn load() -> Profile {
    let path = config_path();
    fs_read(&path)
        .and_then(|raw| serde_json::from_str(&raw).ok())
        .unwrap_or_default()
}

pub fn save(profile: &Profile) -> Result<(), String> {
    let path = config_path();
    if let Some(dir) = path.parent() {
        std::fs::create_dir_all(dir).map_err(|e| e.to_string())?;
    }
    let raw = serde_json::to_string_pretty(profile).map_err(|e| e.to_string())?;
    std::fs::write(path, raw).map_err(|e| e.to_string())
}

fn fs_read(path: &PathBuf) -> Option<String> {
    std::fs::read_to_string(path).ok()
}
