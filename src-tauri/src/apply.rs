use std::process::Command;

pub const HELPER: &str = "/usr/local/lib/cpudoc/cpudoc-apply";

pub fn apply(
    turbo_on: bool,
    max_pct: u32,
    min_pct: u32,
    epp: Option<String>,
) -> Result<String, String> {
    let mut cmd = Command::new("pkexec");
    cmd.arg(HELPER).arg("set");
    cmd.arg("--turbo").arg(if turbo_on { "on" } else { "off" });
    cmd.arg("--max-pct").arg(max_pct.to_string());
    cmd.arg("--min-pct").arg(min_pct.to_string());
    if let Some(p) = epp {
        if !p.is_empty() {
            cmd.arg("--epp").arg(p);
        }
    }
    let out = cmd.output().map_err(|e| format!("failed to run pkexec: {e}"))?;
    let stdout = String::from_utf8_lossy(&out.stdout).trim().to_string();
    let stderr = String::from_utf8_lossy(&out.stderr).trim().to_string();
    if out.status.success() {
        Ok(stdout)
    } else {
        Err(if stderr.is_empty() {
            stdout
        } else {
            format!("{stdout}\n{stderr}")
        })
    }
}
