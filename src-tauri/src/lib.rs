mod apply;
mod commands;
mod config;
mod sysfs;
mod telemetry;

pub fn run() {
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
            commands::load_profile
        ])
        .run(tauri::generate_context!())
        .expect("error while running CPUDoc");
}
