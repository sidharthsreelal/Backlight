mod tray;

use tauri::Manager;
use std::process::Command as StdCommand;

#[tauri::command]
fn search_music(app_handle: tauri::AppHandle, artist: String, count: u32) -> Result<String, String> {
    let script_path = app_handle
        .path()
        .resource_dir()
        .map_err(|e| format!("Failed to get resource dir: {}", e))?
        .join("scripts")
        .join("music_search.py");

    #[allow(unused_mut)]
    let mut command = StdCommand::new("python");
    command.args(&[script_path.to_str().unwrap(), &artist, &count.to_string()]);

    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        command.creation_flags(0x08000000);
    }

    let output = command
        .output()
        .map_err(|e| format!("Failed to run python: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Script error: {}", stderr));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    Ok(stdout.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![search_music])
        .setup(|app| {
            // Create the system tray
            tray::create_tray(app)?;

            // Handle window close — hide instead of quit
            let window = app.get_webview_window("main").unwrap();
            let window_clone = window.clone();
            window.on_window_event(move |event| {
                if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                    api.prevent_close();
                    let _ = window_clone.hide();
                }
            });

            // Position window in bottom-right corner (above taskbar)
            if let Some(monitor) = window.current_monitor().unwrap_or(None) {
                let screen_size = monitor.size();
                let scale = monitor.scale_factor();
                let win_w = (420.0 * scale) as i32;
                let win_h = (420.0 * scale) as i32;
                let margin_x = (12.0 * scale) as i32;
                let margin_y = (60.0 * scale) as i32; // Extra margin for taskbar
                let x = (screen_size.width as i32 - win_w) - margin_x;
                let y = (screen_size.height as i32 - win_h) - margin_y;
                let _ = window.set_position(tauri::Position::Physical(
                    tauri::PhysicalPosition::new(x, y),
                ));
            }

            // Show the window on first launch
            let _ = window.show();
            let _ = window.set_focus();

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

