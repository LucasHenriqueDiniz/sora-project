// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use serde_json::json;
use std::fs;
use std::path::Path;
use tauri::Emitter;
use uuid::Uuid;
use std::path::PathBuf;
// use tauri::Manager;

// Helper para converter erros do Tauri para String
fn to_string_error<E: std::error::Error>(err: E) -> String {
    err.to_string()
}

#[derive(Debug, Serialize, Deserialize)]
struct ProjectConfig {
    file_version: i32,
    project_id: String,
    project_name: String,
    engine_version: String,
    description: String,
    author: String,
    settings: ProjectSettings,
    build: BuildSettings,
    editor_state: EditorState,
}

#[derive(Debug, Serialize, Deserialize)]
struct ProjectSettings {
    resolution: Resolution,
    text_speed: i32,
    auto_save_interval: i32,
}

#[derive(Debug, Serialize, Deserialize)]
struct Resolution {
    width: i32,
    height: i32,
}

#[derive(Debug, Serialize, Deserialize)]
struct BuildSettings {
    output_format: String,
    target_platforms: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct EditorState {
    last_opened_files: Vec<String>,
    recent_scenes: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct ProjectFile {
    path: String,
    name: String,
    #[serde(rename = "type")]
    file_type: String,
    children: Option<Vec<ProjectFile>>,
}

#[derive(Debug, Serialize, Deserialize)]
struct ProjectStructure {
    config: ProjectConfig,
    files: Vec<ProjectFile>,
}

#[derive(Debug, Serialize, Deserialize)]
struct CreateProjectRequest {
    name: String,
    path: String,
    engine: String,
    author: String,
    description: String,
    settings: RequestSettings,
    build: RequestBuild,
}

#[derive(Debug, Serialize, Deserialize)]
struct RequestSettings {
    resolution: Resolution,
    text_speed: i32,
    auto_save_interval: i32,
    language: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct RequestBuild {
    output_format: String,
    target_platforms: Vec<String>,
}

#[tauri::command]
async fn create_project(
    window: tauri::Window,
    config: CreateProjectRequest,
) -> Result<ProjectStructure, String> {
    let project_dir = Path::new(&config.path).join(&config.name);

    // Primeiro, criar o diretório do projeto
    fs::create_dir_all(&project_dir)
        .map_err(|e| format!("Failed to create project directory: {}", e))?;

    window.emit("project-event", json!({
        "type": "action",
        "data": {
            "type": "info",
            "message": "Starting project creation..."
        }
    })).map_err(to_string_error)?;

    // Create directory structure
    let dirs = [
        "Content",
        "Content/Characters",
        "Content/Backgrounds",
        "Content/Music",
        "Content/SoundEffects",
        "Content/Scripts",
        "Content/UI",
        "Config",
        "Saved",
        "Saved/Logs",
        "Saved/Backup",
    ];

    for dir in dirs.iter() {
        window.emit("project-event", json!({
            "type": "action",
            "data": {
                "type": "info",
                "message": format!("Creating directory: {}", dir)
            }
        })).map_err(to_string_error)?;

        let full_path = project_dir.join(dir);
        fs::create_dir_all(&full_path)
            .map_err(|e| format!("Failed to create directory {}: {}", dir, e))?;
    }

    window.emit("project-event", json!({
        "type": "action",
        "data": {
            "type": "info",
            "message": "Creating project configuration..."
        }
    })).map_err(to_string_error)?;

    // Create project file
    let project_config = ProjectConfig {
        file_version: 1,
        project_id: Uuid::new_v4().to_string(),
        project_name: config.name.clone(),
        engine_version: "1.0".to_string(),
        description: config.description,
        author: config.author,
        settings: ProjectSettings {
            resolution: config.settings.resolution,
            text_speed: config.settings.text_speed,
            auto_save_interval: config.settings.auto_save_interval,
        },
        build: BuildSettings {
            output_format: "react-native".to_string(),
            target_platforms: vec!["android".to_string(), "ios".to_string()],
        },
        editor_state: EditorState {
            last_opened_files: vec![],
            recent_scenes: vec![],
        },
    };

    // Save config
    fs::write(
        project_dir.join(format!("{}.sora", config.name)),
        serde_json::to_string_pretty(&project_config).map_err(|e| e.to_string())?,
    )
    .map_err(|e| e.to_string())?;

    window.emit("project-event", json!({
        "type": "action",
        "data": {
            "type": "info",
            "message": "Project created successfully!"
        }
    })).map_err(to_string_error)?;

    Ok(ProjectStructure {
        config: project_config,
        files: read_dir_filtered(&project_dir.to_string_lossy()).map_err(|e| e.to_string())?,
    })
}

#[tauri::command]
async fn read_project_files(project_path: String) -> Result<ProjectStructure, String> {
    let path = Path::new(&project_path);
    let project_dir = if path.is_file() {
        // Se for um arquivo .sora, use o diretório pai
        path.parent()
            .ok_or_else(|| "Invalid project path".to_string())?
            .to_path_buf()
    } else {
        // Se for um diretório, use-o diretamente
        path.to_path_buf()
    };

    // Procura pelo arquivo .sora no diretório
    let mut sora_file_path = None;
    let dir_entries = fs::read_dir(&project_dir)
        .map_err(|e| format!("Failed to read directory: {}", e))?;

    for entry in dir_entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        if path.extension().and_then(|ext| ext.to_str()) == Some("sora") {
            sora_file_path = Some(path);
            break;
        }
    }

    let sora_file_path = sora_file_path.ok_or_else(|| "No .sora project file found".to_string())?;

    // Lê e analisa a configuração do projeto
    let config_content = fs::read_to_string(&sora_file_path)
        .map_err(|e| format!("Failed to read .sora file: {}", e))?;

    let config: ProjectConfig = serde_json::from_str(&config_content)
        .map_err(|e| format!("Failed to parse project config: {}", e))?;

    // Lê a estrutura do diretório do projeto
    let files = read_dir_filtered(project_dir.to_str().unwrap())
        .map_err(|e| format!("Failed to read project structure: {}", e))?;

    Ok(ProjectStructure { config, files })
}

fn read_dir_filtered(path: &str) -> Result<Vec<ProjectFile>, String> {
    let mut files = Vec::new();
    let dir_entries = fs::read_dir(path)
        .map_err(|e| e.to_string())?;

    for entry in dir_entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        let name = path
            .file_name()
            .unwrap_or_default()
            .to_string_lossy()
            .into_owned();

        // Skip hidden files and specific directories
        if name.starts_with('.') || name == "node_modules" || name == "target" {
            continue;
        }

        let metadata = entry.metadata().map_err(|e| e.to_string())?;
        let is_dir = metadata.is_dir();

        let mut file = ProjectFile {
            path: path.to_string_lossy().into_owned(),
            name,
            file_type: if is_dir {
                "directory".to_string()
            } else {
                "file".to_string()
            },
            children: None,
        };

        if is_dir {
            file.children = Some(read_dir_filtered(path.to_str().unwrap_or_default())?);
        }

        files.push(file);
    }

    // Sort directories first, then files
    files.sort_by(|a, b| match (a.file_type.as_str(), b.file_type.as_str()) {
        ("directory", "file") => std::cmp::Ordering::Less,
        ("file", "directory") => std::cmp::Ordering::Greater,
        _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
    });

    Ok(files)
}

#[tauri::command]
async fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| format!("Failed to read file {}: {}", path, e))
}

#[tauri::command]
async fn save_editor_state(_state: serde_json::Value) -> Result<(), String> {
    // Implementar salvamento do estado se necessário
    Ok(())
}

#[tauri::command]
async fn load_editor_state() -> Result<serde_json::Value, String> {
    // Implementar carregamento do estado se necessário
    Ok(serde_json::json!({
        "containers": [],
        "active_tab_index": 0
    }))
}

#[tauri::command]
async fn create_file(parent_path: String, temp_name: String) -> Result<(), String> {
    let path = PathBuf::from(parent_path).join(temp_name);
    
    // Verificar se o diretório pai existe
    if let Some(parent) = path.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("Failed to create parent directories: {}", e))?;
        }
    }

    // Criar arquivo vazio
    fs::File::create(&path)
        .map_err(|e| format!("Failed to create file: {}", e))?;

    Ok(())
}

#[tauri::command]
async fn create_directory(path: String) -> Result<(), String> {
    fs::create_dir_all(path)
        .map_err(|e| format!("Failed to create directory: {}", e))
}

#[tauri::command]
async fn delete_path(path: String) -> Result<(), String> {
    let path = PathBuf::from(path);
    if path.is_dir() {
        fs::remove_dir_all(&path)
    } else {
        fs::remove_file(&path)
    }
    .map_err(|e| format!("Failed to delete path: {}", e))
}

#[tauri::command]
async fn rename_path(old_path: String, new_name: String) -> Result<(), String> {
    let path = PathBuf::from(old_path);
    let parent = path.parent()
        .ok_or_else(|| "Invalid path".to_string())?;
    let new_path = parent.join(new_name);

    if new_path.exists() {
        return Err("Path already exists".to_string());
    }

    fs::rename(&path, &new_path)
        .map_err(|e| format!("Failed to rename: {}", e))
}

#[tauri::command]
async fn create_folder(window: tauri::Window, path: String, name: String) -> Result<ProjectFile, String> {
    window.emit("project-event", json!({
        "type": "action",
        "data": {
            "type": "info",
            "message": format!("Creating folder: {}", name)
        }
    })).map_err(to_string_error)?;

    let folder_path = Path::new(&path).join(&name);
    
    // Verifica se a pasta já existe
    if folder_path.exists() {
        return Err(format!("Folder {} already exists", name));
    }

    // Cria a pasta
    fs::create_dir(&folder_path)
        .map_err(|e| format!("Failed to create folder: {}", e))?;

    window.emit("project-event", json!({
        "type": "action",
        "data": {
            "type": "success",
            "message": format!("Folder created: {}", name)
        }
    })).map_err(to_string_error)?;

    Ok(ProjectFile {
        path: folder_path.to_string_lossy().into_owned(),
        name,
        file_type: "directory".to_string(),
        children: Some(vec![]),
    })
}

#[tauri::command]
async fn delete_file(window: tauri::Window, path: String) -> Result<(), String> {
    let path = Path::new(&path);
    let name = path.file_name()
        .ok_or_else(|| "Invalid file path".to_string())?
        .to_string_lossy();

    window.emit("project-event", json!({
        "type": "action",
        "data": {
            "type": "info",
            "message": format!("Deleting: {}", name)
        }
    })).map_err(to_string_error)?;
    
    if path.is_dir() {
        fs::remove_dir_all(path)
            .map_err(|e| format!("Failed to delete folder: {}", e))?;
    } else {
        fs::remove_file(path)
            .map_err(|e| format!("Failed to delete file: {}", e))?;
    }

    window.emit("project-event", json!({
        "type": "action",
        "data": {
            "type": "success",
            "message": format!("Deleted: {}", name)
        }
    })).map_err(to_string_error)?;

    Ok(())
}

#[tauri::command]
async fn move_file(window: tauri::Window, source: String, destination: String) -> Result<ProjectFile, String> {
    window.emit("project-event", json!({
        "type": "action",
        "data": {
            "type": "info",
            "message": format!("Moving file: {} to {}", source, destination)
        }
    })).map_err(to_string_error)?;

    let source_path = Path::new(&source);
    let dest_path = Path::new(&destination);

    // Verifica se o destino já existe
    if dest_path.exists() {
        return Err(format!("Destination {} already exists", destination));
    }

    // Move o arquivo/pasta
    fs::rename(source_path, dest_path)
        .map_err(|e| format!("Failed to move file: {}", e))?;

    let is_dir = dest_path.is_dir();
    let name = dest_path.file_name()
        .ok_or_else(|| "Invalid destination path".to_string())?
        .to_string_lossy()
        .into_owned();

    let mut file = ProjectFile {
        path: dest_path.to_string_lossy().into_owned(),
        name,
        file_type: if is_dir { "directory" } else { "file" }.to_string(),
        children: None,
    };

    // Se for diretório, lê os filhos
    if is_dir {
        file.children = Some(read_dir_filtered(dest_path.to_str().unwrap())?);
    }

    window.emit("project-event", json!({
        "type": "action",
        "data": {
            "type": "success",
            "message": format!("File moved: {} to {}", source, destination)
        }
    })).map_err(to_string_error)?;

    Ok(file)
}

#[tauri::command]
async fn find_sora_file(project_path: String) -> Result<String, String> {
    let path = Path::new(&project_path);
    
    // Se já for um arquivo .sora, retornar ele mesmo
    if path.is_file() && path.extension().and_then(|ext| ext.to_str()) == Some("sora") {
        return Ok(project_path);
    }

    // Se for um diretório, procurar por um arquivo .sora
    if path.is_dir() {
        for entry in fs::read_dir(path).map_err(|e| e.to_string())? {
            let entry = entry.map_err(|e| e.to_string())?;
            let path = entry.path();
            if path.extension().and_then(|ext| ext.to_str()) == Some("sora") {
                return Ok(path.to_string_lossy().into_owned());
            }
        }
    }

    Err("No .sora file found in project directory".to_string())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            create_project,
            read_project_files,
            read_file,
            save_editor_state,
            load_editor_state,
            create_file,
            create_directory,
            delete_path,
            rename_path,
            create_folder,
            delete_file,
            move_file,
            find_sora_file,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
