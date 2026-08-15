use std::collections::HashMap;
use std::fs;
use std::sync::Mutex;
use std::thread;
use std::time::{Duration, Instant};

use tauri::{App, Emitter, Manager};

#[derive(Debug, Clone, serde::Serialize)]
pub struct Power {
    pub package: Option<f64>,
    pub cores: Option<f64>,
    pub uncore: Option<f64>,
    pub dram: Option<f64>,
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct Sample {
    pub package_temp: Option<f64>,
    pub core_temps: Vec<f64>,
    pub cpu_freqs: Vec<u64>,
    pub cpu_usage: Vec<f64>,
    pub total_usage: f64,
    pub power: Power,
}

pub struct TelemetryState {
    pub last: Mutex<Option<Sample>>,
}

impl Default for TelemetryState {
    fn default() -> Self {
        Self {
            last: Mutex::new(None),
        }
    }
}

struct Prev {
    proc_stat: HashMap<String, (u64, u64)>,
    rapl: HashMap<String, u64>,
    t: Instant,
}

fn read_u64(path: &str) -> Option<u64> {
    fs::read_to_string(path)
        .ok()
        .and_then(|s| s.trim().parse().ok())
}

fn coretemp_dir() -> Option<String> {
    let base = "/sys/class/hwmon";
    for entry in fs::read_dir(base).ok()?.flatten() {
        let name = fs::read_to_string(entry.path().join("name")).ok()?;
        if name.trim() == "coretemp" {
            return Some(entry.path().to_string_lossy().into_owned());
        }
    }
    None
}

fn read_proc_stat() -> HashMap<String, (u64, u64)> {
    let content = fs::read_to_string("/proc/stat").unwrap_or_default();
    let mut map = HashMap::new();
    for line in content.lines() {
        if !line.starts_with("cpu") {
            continue;
        }
        let mut it = line.split_whitespace();
        let name = it.next().unwrap_or_default().to_string();
        let vals: Vec<u64> = it.filter_map(|v| v.parse().ok()).collect();
        if vals.len() < 4 {
            continue;
        }
        let idle = vals[3].saturating_add(vals.get(4).copied().unwrap_or(0));
        let total = vals.iter().sum();
        map.insert(name, (total, idle));
    }
    map
}

fn usage_pct(prev: &Prev, stat: &HashMap<String, (u64, u64)>, cpu: &str) -> f64 {
    let (t, i) = stat.get(cpu).copied().unwrap_or((0, 0));
    let (pt, pi) = prev.proc_stat.get(cpu).copied().unwrap_or((0, 0));
    let dtot = t.saturating_sub(pt) as f64;
    let didle = i.saturating_sub(pi) as f64;
    if dtot > 0.0 {
        ((dtot - didle) / dtot * 100.0).clamp(0.0, 100.0)
    } else {
        0.0
    }
}

fn sample(prev: &mut Prev, ncpus: usize) -> Sample {
    let now = Instant::now();
    let dt = now.duration_since(prev.t).as_secs_f64().max(0.001);

    let stat = read_proc_stat();
    let mut cpu_usage = Vec::with_capacity(ncpus);
    for i in 0..ncpus {
        cpu_usage.push(usage_pct(prev, &stat, &format!("cpu{i}")));
    }
    let total_usage = usage_pct(prev, &stat, "cpu");
    prev.proc_stat = stat;

    let mut cpu_freqs = Vec::with_capacity(ncpus);
    for i in 0..ncpus {
        cpu_freqs.push(
            read_u64(&format!(
                "/sys/devices/system/cpu/cpu{i}/cpufreq/scaling_cur_freq"
            ))
            .unwrap_or(0),
        );
    }

    let rapl_paths = [
        ("package", "/sys/class/powercap/intel-rapl:0"),
        ("cores", "/sys/class/powercap/intel-rapl:0:0"),
        ("uncore", "/sys/class/powercap/intel-rapl:0:1"),
        ("dram", "/sys/class/powercap/intel-rapl:0:2"),
    ];
    let mut power = Power {
        package: None,
        cores: None,
        uncore: None,
        dram: None,
    };
    let mut rapl_now = HashMap::new();
    for (key, path) in rapl_paths {
        if let Some(e) = read_u64(&format!("{path}/energy_uj")) {
            if let Some(pe) = prev.rapl.get(path) {
                let de = e.wrapping_sub(*pe) as f64;
                let watts = de / 1_000_000.0 / dt;
                match key {
                    "package" => power.package = Some(watts),
                    "cores" => power.cores = Some(watts),
                    "uncore" => power.uncore = Some(watts),
                    "dram" => power.dram = Some(watts),
                    _ => {}
                }
            }
            rapl_now.insert(path.to_string(), e);
        }
    }
    prev.rapl = rapl_now;

    let mut package_temp = None;
    let mut core_temps = Vec::new();
    if let Some(dir) = coretemp_dir() {
        let mut idx = 1;
        loop {
            match read_u64(&format!("{dir}/temp{idx}_input")) {
                Some(v) => {
                    let c = v as f64 / 1000.0;
                    if idx == 1 {
                        package_temp = Some(c);
                    } else {
                        core_temps.push(c);
                    }
                    idx += 1;
                }
                None => break,
            }
        }
    }

    prev.t = now;
    Sample {
        package_temp,
        core_temps,
        cpu_freqs,
        cpu_usage,
        total_usage,
        power,
    }
}

pub fn start(app: &mut App) {
    let ncpus = crate::sysfs::ncpus().max(1);
    app.manage(TelemetryState::default());
    let handle = app.handle().clone();
    thread::spawn(move || {
        let mut prev = Prev {
            proc_stat: HashMap::new(),
            rapl: HashMap::new(),
            t: Instant::now(),
        };
        let _ = sample(&mut prev, ncpus);
        loop {
            thread::sleep(Duration::from_secs(1));
            let s = sample(&mut prev, ncpus);
            if let Some(state) = handle.try_state::<TelemetryState>() {
                *state.last.lock().unwrap() = Some(s.clone());
            }
            let _ = handle.emit("telemetry", &s);
        }
    });
}
