export interface ProjectFile {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: ProjectFile[];
}

export interface ProjectConfig {
  name: string;
  path: string;
  engine: ProjectEngine;
  author: string;
  description: string;
  settings: {
    resolution: {
      width: number;
      height: number;
    };
    textSpeed: number;
    autoSaveInterval: number;
    language: "en" | "pt-br";
  };
  build: {
    outputFormat: "react-native";
    targetPlatforms: string[];
  };
}

export interface RustProjectConfig {
  file_version: number;
  project_id: string;
  project_name: string;
  engine_version: string;
  description: string;
  author: string;
  settings: {
    resolution: {
      width: number;
      height: number;
    };
    text_speed: number;
    auto_save_interval: number;
  };
  build: {
    output_format: string;
    target_platforms: string[];
  };
  editor_state: {
    last_opened_files: string[];
    recent_scenes: string[];
  };
}

export interface ProjectResponse {
  config: RustProjectConfig;
  files: ProjectFile[];
}

export type ProjectEngine = "sora-engine";

export interface RecentProject {
  name: string;
  path: string;
  lastOpened: number;
}
