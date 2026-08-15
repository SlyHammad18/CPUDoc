mod apply;
mod autostart;
mod cli;
mod commands;
mod config;
mod sysfs;
mod telemetry;

pub fn run() {
    if let Some(code) = cli::maybe_run(&std::env::args().collect::<Vec<_>>()) {
        std::process::exit(code);
    }
    tauri::Builder::default()
        .setup(|app| {
            telemetry::start(app);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_state,
            commands::get_telemetry,
            commands::apply_settings,
            commands::save_profile,
            commands::load_profile,
            commands::get_autostart,
            commands::set_autostart
        ])
        .run(tauri::generate_context!())
        .expect("error while running CPUDoc");
}
