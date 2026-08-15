use std::fs;
use std::path::PathBuf;

fn config_home() -> PathBuf {
    std::env::var("XDG_CONFIG_HOME")
        .map(PathBuf::from)
        .unwrap_or_else(|_| {
            std::env::var("HOME")
                .map(PathBuf::from)
                .unwrap_or_default()
                .join(".config")
        })
}

fn autostart_path() -> PathBuf {
    config_home().join("autostart").join("cpudoc.desktop")
}

pub fn enabled() -> bool {
    fs::read_to_string(autostart_path())
        .map(|c| c.contains("Exec="))
        .unwrap_or(false)
}

pub fn set(enabled: bool) -> Result<(), String> {
    let path = autostart_path();
    if !enabled {
        let _ = fs::remove_file(&path);
        return Ok(());
    }
    if let Some(dir) = path.parent() {
        fs::create_dir_all(dir).map_err(|e| e.to_string())?;
    }
    let exe = std::env::current_exe()
        .map(|p| p.display().to_string())
        .unwrap_or_else(|_| "cpudoc".to_string());
    let content = format!(
        "[Desktop Entry]\n\
         Type=Application\n\
         Name=CPUDoc\n\
         Comment=Control and monitor the CPU\n\
         Exec=\"{exe}\"\n\
         Terminal=false\n\
         X-GNOME-Autostart-enabled=true\n"
    );
    fs::write(path, content).map_err(|e| e.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn with_temp_config(f: impl FnOnce()) {
        let dir = std::env::temp_dir().join(format!(
            "cpudoc-autostart-test-{}",
            std::process::id()
        ));
        std::env::set_var("XDG_CONFIG_HOME", &dir);
        f();
        let _ = fs::remove_dir_all(&dir);
        std::env::remove_var("XDG_CONFIG_HOME");
    }

    #[test]
    fn writes_and_reads_desktop_entry() {
        with_temp_config(|| {
            assert!(!enabled());
            set(true).unwrap();
            assert!(enabled());
            let raw = fs::read_to_string(autostart_path()).unwrap();
            assert!(raw.contains("[Desktop Entry]"));
            assert!(raw.contains("Type=Application"));
            assert!(raw.contains("X-GNOME-Autostart-enabled=true"));
            set(false).unwrap();
            assert!(!enabled());
            assert!(!autostart_path().exists());
        });
    }
}