use std::fs;

const INTEL_PSTATE: &str = "/sys/devices/system/cpu/intel_pstate";
const CPUFREQ_BASE: &str = "/sys/devices/system/cpu/cpu0/cpufreq";

pub fn read(path: &str) -> Option<String> {
    fs::read_to_string(path).ok().map(|s| s.trim().to_string())
}

fn read_num<T>(path: &str) -> Option<T>
where
    T: std::str::FromStr,
{
    read(path).and_then(|s| s.parse().ok())
}

pub fn no_turbo() -> Option<bool> {
    read_num::<u8>(&format!("{INTEL_PSTATE}/no_turbo")).map(|v| v == 1)
}

pub fn max_perf_pct() -> Option<u32> {
    read_num(&format!("{INTEL_PSTATE}/max_perf_pct"))
}

pub fn min_perf_pct() -> Option<u32> {
    read_num(&format!("{INTEL_PSTATE}/min_perf_pct"))
}

pub fn turbo_pct() -> Option<u32> {
    read_num(&format!("{INTEL_PSTATE}/turbo_pct"))
}

pub fn base_freq_khz() -> Option<u64> {
    read_num(&format!("{CPUFREQ_BASE}/base_frequency"))
        .or_else(|| read_num(&format!("{CPUFREQ_BASE}/cpuinfo_max_freq")))
}

pub fn min_freq_khz() -> Option<u64> {
    read_num(&format!("{CPUFREQ_BASE}/cpuinfo_min_freq"))
}

pub fn turbo_max_khz() -> Option<u64> {
    let base = base_freq_khz()?;
    let tp = turbo_pct().unwrap_or(0);
    Some(base + base * u64::from(tp) / 100)
}

pub fn governor() -> Option<String> {
    read(&format!("{CPUFREQ_BASE}/scaling_governor"))
}

pub fn driver() -> Option<String> {
    read(&format!("{CPUFREQ_BASE}/scaling_driver"))
}

pub fn epp_prefs() -> Vec<String> {
    read(&format!("{CPUFREQ_BASE}/energy_performance_available_preferences"))
        .map(|s| s.split_whitespace().map(ToOwned::to_owned).collect())
        .unwrap_or_default()
}

pub fn epp() -> Option<String> {
    read(&format!("{CPUFREQ_BASE}/energy_performance_preference"))
}

pub fn ncpus() -> usize {
    fs::read_dir("/sys/devices/system/cpu")
        .map(|it| {
            it.filter_map(|e| e.ok())
                .filter(|e| {
                    let n = e.file_name();
                    let n = n.to_string_lossy();
                    n.starts_with("cpu") && n[3..].chars().all(|c| c.is_ascii_digit())
                })
                .count()
        })
        .unwrap_or(0)
}
