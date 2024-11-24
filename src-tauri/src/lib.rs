// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use serde::{Deserialize, Serialize};
use std::fs;
use tauri::Manager;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn read_project_files(project_path: String) -> Result<ProjectStructure, String> {
    // Read the main project files
    let scenes = fs::read_to_string(format!("{}/scenes.rpy", project_path)).unwrap_or_default();
    let characters =
        fs::read_to_string(format!("{}/characters.rpy", project_path)).unwrap_or_default();
    let backgrounds =
        fs::read_to_string(format!("{}/backgrounds.rpy", project_path)).unwrap_or_default();
    let audio = fs::read_to_string(format!("{}/audio.rpy", project_path)).unwrap_or_default();

    Ok(ProjectStructure {
        scenes,
        characters,
        backgrounds,
        audio,
    })
}

#[tauri::command]
async fn save_file(path: String, content: String) -> Result<(), String> {
    fs::write(path, content).map_err(|e| e.to_string())
}

#[tauri::command]
async fn save_layout(app: tauri::AppHandle, layout: String) -> Result<(), String> {
    let config_dir = app
        .path()
        .app_config_dir()
        .map_err(|_| "Failed to get config directory".to_string())?;
    let layout_path = config_dir.join("layout.json");

    fs::create_dir_all(&config_dir).map_err(|e| e.to_string())?;

    fs::write(layout_path, layout).map_err(|e| e.to_string())
}

#[tauri::command]
async fn load_layout(app: tauri::AppHandle) -> Result<String, String> {
    let config_dir = app
        .path()
        .app_config_dir()
        .map_err(|_| "Failed to get config directory".to_string())?;
    let layout_path = config_dir.join("layout.json");

    if layout_path.exists() {
        fs::read_to_string(layout_path).map_err(|e| e.to_string())
    } else {
        Ok("".to_string())
    }
}

#[derive(Debug, Serialize, Deserialize)]
struct TabState {
    id: String,
    title: String,
    type_: String, // usando type_ porque 'type' é palavra reservada
    path: String,
    content: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct EditorState {
    tabs: Vec<TabState>,
    active_tab_index: usize,
}

#[tauri::command]
async fn save_editor_state(app: tauri::AppHandle, state: EditorState) -> Result<(), String> {
    let config_dir = app
        .path()
        .app_config_dir()
        .map_err(|_| "Failed to get config directory".to_string())?;
    let state_path = config_dir.join("editor-state.json");

    fs::create_dir_all(&config_dir).map_err(|e| e.to_string())?;

    let state_json = serde_json::to_string(&state).map_err(|e| e.to_string())?;

    fs::write(state_path, state_json).map_err(|e| e.to_string())
}

#[tauri::command]
async fn load_editor_state(app: tauri::AppHandle) -> Result<EditorState, String> {
    let config_dir = app
        .path()
        .app_config_dir()
        .map_err(|_| "Failed to get config directory".to_string())?;
    let state_path = config_dir.join("editor-state.json");

    if state_path.exists() {
        let state_json = fs::read_to_string(state_path).map_err(|e| e.to_string())?;

        serde_json::from_str(&state_json).map_err(|e| e.to_string())
    } else {
        Ok(EditorState {
            tabs: Vec::new(),
            active_tab_index: 0,
        })
    }
}

// Add this struct definition
#[derive(Debug, serde::Serialize)]
struct ProjectStructure {
    scenes: String,
    characters: String,
    backgrounds: String,
    audio: String,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet,
            read_project_files,
            save_file,
            save_layout,
            load_layout,
            save_editor_state,
            load_editor_state
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
