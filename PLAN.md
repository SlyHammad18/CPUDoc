# CPUDoc — Implementation Plan

Control and monitor the CPU (Intel i7-6700HQ) on Debian 13 (GNOME) with a dark, modern desktop app.

## Decisions (confirmed with user)

- **Stack:** Tauri v2 (Rust backend + web frontend). webkit2gtk-4.1 / gtk3 / libsoup3 present.
- **Frontend:** React 19 + Vite + TypeScript + Tailwind v4 + Motion (framer-motion). Icons: `@phosphor-icons/react`.
- **Clock control:** cap-only via `max_perf_pct` (intel_pstate; no `userspace` governor → no true fixed clock).
- **Start on login:** optional in-app toggle (writes `~/.config/autostart/cpudoc.desktop`), **default OFF**.
- **Auth:** custom polkit action `io.cpudoc.apply` with `auth_admin_keep` (one password prompt per session; no prompt at login).

## Hardware / control surface

- Driver `intel_pstate` (HWP active), governor `powersave`.
- Base 2.6 GHz, min 800 MHz, turbo ≈ +33% (~3.5 GHz). Turbo currently disabled at boot (`no_turbo=1`).
- Writable (root): `/sys/devices/system/cpu/intel_pstate/{no_turbo,max_perf_pct,min_perf_pct}` + HWP EPP (`energy_performance_preference`, values: performance / balance_performance / balance_power / power).
- Clock slider maps MHz → `max_perf_pct = desired_mhz / turbo_max_mhz * 100`.

## Telemetry sources (all read-only, no root)

| Metric | Source |
|---|---|
| Temps | `coretemp` hwmon (package + 4 core sensors) |
| Power | RAPL `intel-rapl:0` → package, cores, uncore, dram (`energy_uj` deltas → watts). **Debian 13 restricts these to root (0400)**; `install.sh` ships a udev rule + chmod so unprivileged reads work. |
| Per-core clock | `/sys/devices/system/cpu/cpuN/cpufreq/scaling_cur_freq` (0-7) |
| Per-core / total usage | `/proc/stat` deltas |

## Design spec (from design-taste-frontend / frontend-design skills)

- **Read:** system utility for a power user, "instrument panel" language, dark-only.
- **Dials:** VARIANCE 5 / MOTION 4-5 / DENSITY 6. Motion orchestrated around the live telemetry cluster; restrained elsewhere. `prefers-reduced-motion` degrades to static.
- **Palette:** base `#0B0E14` (near-black blue), elevated `#12161D`, hairline `#1E2530`, text `#E6EAF0`, muted `#99A2B4`, **single emerald-teal accent `#2DD4A8`** (dim `#129C80`); thermal ramp builds on it: teal (cool) → `#E8703D` warm → `#E84B3D` hot. No AI-purple, no acid-green.
- **Type:** Geist (sans) + JetBrains Mono (live numerals), self-hosted via fontsource (offline).
- **Window:** frameless (`decorations: false`, 1120×720) with custom titlebar — brand + CPU model, live/turbo pills, native-style min/max/close controls (`core:window` permissions).
- **Signature:** live "instrument cluster" — CPU usage ring, frequency gauge, per-core usage bars, package temp with amber→warm color scale, RAPL power readout with rolling 60s sparklines (SVG polylines animated via Motion).
- **Layout:** left control rail (turbo toggle, MHz cap slider, EPP select, save profile, Apply) · right telemetry panel.
- A11y: full keyboard focus, WCAG AA contrast, `:active` press feedback, no wrapping CTAs.

## Task division

### Phase 0 — Scaffold
1. Scaffold Tauri v2 + React 19 + Vite + TS + Tailwind v4 + Motion project; install deps; git init.

### Phase 1 — Backend & core
2. `cpudoc-apply` root helper (validated sysfs writes: `no_turbo`, `max_perf_pct`, EPP; `set`/`status`/`list` subcommands).
3. Polkit action `io.cpudoc.apply` (`auth_admin_keep`) + `install.sh` / `uninstall.sh` (helper, polkit, desktop entry).
4. Rust core: sysfs reads for turbo/caps/governor/EPP, `pkexec` spawn, config persistence (`~/.config/cpudoc/config.json`), tauri commands.
5. **Telemetry module:** reads coretemp, RAPL `energy_uj`, per-core `scaling_cur_freq`, `/proc/stat`; computes usage% and watts from deltas; 1Hz ticker emits `telemetry` events to the frontend.

### Phase 2 — Frontend (design work)
6. Token system: palette, Geist + JetBrains Mono (fontsource), radius scale. — DONE
7. Control rail: turbo toggle, MHz cap slider (→ `max_perf_pct`), EPP select, save profile, Apply. — DONE (seeds from live sysfs)
8. **Telemetry panel:** CPU usage ring (animated), 8 per-core usage bars, per-core freq, package + per-core temps, RAPL power (package/cores/uncore/dram) + rolling sparklines. — DONE
9. Loading / error / needs-root / no-sensor states; keyboard focus; `prefers-reduced-motion`. — DONE
10. Micro-interactions: `:active` press feedback, toggle spring, gauge sweep. — DONE (verified via gnome-screenshot → describe_image, including pixel-measured bar extents)

### Phase 3 — Behaviors
11. Optional autostart `.desktop` writer (in-app toggle, default OFF). — DONE (`src-tauri/src/autostart.rs`, `get/set_autostart` commands, toggle in ApplyBar card; unit-tested)
12. `--apply-profile` CLI flag. — DONE (`src-tauri/src/cli.rs`; profiles: performance/balanced/power/eco/quiet, omit name → saved profile; `--help`)

### Phase 4 — Verify & package
13. `gnome-screenshot -w` → `describe_image` → iterate on UI (verify animations mid-poll). — DONE (pixel-measured column bottoms; verified gauge/slider/cap readouts)
14. Functional test: apply settings + read back sysfs to confirm turbo off + cap holds; sanity-check telemetry (temp ≈ 40-70°C, idle watts < 20, usage sums ≈ 100%·cores). — DONE (calibrated `max_perf_pct` → MHz: 50→1800, 67→2400, matching `achievedCapKhz`; pkexec apply + readback verified)
15. Package `.deb` via Tauri bundler. — DONE (`@tauri-apps/cli` devDep; `bundle.linux.deb.files` ships helper/policy/udev rule; icon regenerated to emerald teal via `resources/make_icon.py`)

## Packaging notes

- **Build:** `npm --prefix frontend run tauri build` (or `frontend/node_modules/.bin/tauri build` from `src-tauri/`). Output: `src-tauri/target/release/bundle/deb/CPUDoc_0.1.0_amd64.deb` (binary package `cpu-doc`).
- **Ships in the deb** (via `bundle.linux.deb.files`, modes preserved from `resources/`):
  - `/usr/local/lib/cpudoc/cpudoc-apply` (0755) — root apply helper
  - `/usr/share/polkit-1/actions/io.cpudoc.policy` (0644)
  - `/etc/udev/rules.d/99-cpudoc-powercap.rules` (0644) — RAPL readable by users
- **Icon:** `resources/make_icon.py` procedurally renders the teal gauge icon into `src-tauri/icons/` (32/128/256/512 + 1024 `icon-source.png`), no external deps.
- `install.sh` / `uninstall.sh` remain the manual fallback; the deb is the canonical install path.