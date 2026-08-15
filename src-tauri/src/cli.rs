use crate::apply;
use crate::config::Profile;
use crate::sysfs;

fn presets() -> Vec<(&'static str, Profile)> {
    vec![
        (
            "performance",
            Profile {
                turbo_enabled: true,
                max_perf_pct: 100,
                min_perf_pct: 22,
                epp: Some("performance".to_string()),
            },
        ),
        (
            "balanced",
            Profile {
                turbo_enabled: true,
                max_perf_pct: 100,
                min_perf_pct: 22,
                epp: Some("balance_performance".to_string()),
            },
        ),
        (
            "power",
            Profile {
                turbo_enabled: true,
                max_perf_pct: 100,
                min_perf_pct: 22,
                epp: Some("balance_power".to_string()),
            },
        ),
        (
            "eco",
            Profile {
                turbo_enabled: true,
                max_perf_pct: 100,
                min_perf_pct: 22,
                epp: Some("power".to_string()),
            },
        ),
        (
            "quiet",
            Profile {
                turbo_enabled: false,
                max_perf_pct: 100,
                min_perf_pct: 22,
                epp: Some("balance_power".to_string()),
            },
        ),
    ]
}

fn with_current_min(mut p: Profile) -> Profile {
    p.min_perf_pct = sysfs::min_perf_pct().unwrap_or(22);
    p
}

pub const USAGE: &str =
    "usage: cpudoc [--apply-profile [profile]]\n\n\
     profiles: performance, balanced, power, eco, quiet\n\
     (omit the profile name to apply the saved profile)";

pub fn maybe_run(args: &[String]) -> Option<i32> {
    if args.iter().any(|a| a == "-h" || a == "--help") {
        println!("{USAGE}");
        return Some(0);
    }
    let idx = args
        .iter()
        .position(|a| a == "--apply-profile" || a == "-p")?;
    if args.iter().any(|a| a == "-h" || a == "--help") {
        println!("{USAGE}");
        return Some(0);
    }

    let value = args
        .get(idx + 1)
        .filter(|v| !v.starts_with('-'))
        .map(|s| s.to_ascii_lowercase());

    let presets = presets();
    let (profile, name) = match value {
        Some(name) => match presets.iter().find(|(n, _)| *n == name) {
            Some((_, p)) => (with_current_min(p.clone()), name),
            None => {
                eprintln!(
                    "cpudoc: unknown profile '{name}'. Available: {}",
                    presets.iter().map(|(n, _)| *n).collect::<Vec<_>>().join(", ")
                );
                return Some(2);
            }
        },
        None => (crate::config::load(), "saved".to_string()),
    };

    match apply::apply(
        profile.turbo_enabled,
        profile.max_perf_pct,
        profile.min_perf_pct,
        profile.epp,
    ) {
        Ok(out) => {
            println!(
                "applied profile '{name}'{}",
                if out.is_empty() {
                    String::new()
                } else {
                    format!(": {out}")
                }
            );
            Some(0)
        }
        Err(e) => {
            eprintln!("cpudoc: failed to apply profile '{name}': {e}");
            Some(1)
        }
    }
}