import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import type { ProjectConfig, ProjectFile, ProjectResponse } from "../types/project";

export class ProjectManager {
  static async createProject(config: ProjectConfig): Promise<{
    config: ProjectConfig;
    files: ProjectFile[];
  }> {
    try {
      const normalizedPath = config.path.replace(/\\/g, "/").replace(/\/$/, "");
      console.log("Creating project with path:", normalizedPath);

      const request = {
        name: config.name,
        path: normalizedPath,
        engine: config.engine,
        author: config.author,
        description: config.description,
        settings: {
          resolution: config.settings.resolution,
          text_speed: config.settings.textSpeed,
          auto_save_interval: config.settings.autoSaveInterval,
          language: config.settings.language,
        },
        build: {
          output_format: config.build.outputFormat,
          target_platforms: config.build.targetPlatforms,
        },
      };

      console.log("Sending request:", JSON.stringify({ config: request }, null, 2));
      const response = await invoke<ProjectResponse>("create_project", { config: request });
      console.log("Received response:", response);

      return {
        config: {
          ...config,
          path: `${normalizedPath}/${config.name}`,
          name: response.config.project_name,
        },
        files: response.files,
      };
    } catch (error) {
      console.error("Create project error details:", error);
      const errorMessage = error instanceof Error ? error.message : typeof error === "string" ? error : "An unexpected error occurred";
      throw new Error(`Failed to create project: ${errorMessage}`);
    }
  }

  static async openProject(projectPath?: string): Promise<{
    config: ProjectConfig;
    files: ProjectFile[];
  } | null> {
    try {
      let selected = projectPath;

      if (!selected) {
        selected = (await open({
          filters: [
            {
              name: "Sora Project",
              extensions: ["sora"],
            },
          ],
          multiple: false,
          title: "Open Project",
        })) as string;
      }

      if (!selected) return null;

      const normalizedPath = selected.replace(/\\/g, "/");
      const response = await invoke<ProjectResponse>("read_project_files", {
        projectPath: normalizedPath,
      });

      const projectDir = normalizedPath.substring(0, normalizedPath.lastIndexOf("/"));

      return {
        config: {
          name: response.config.project_name,
          path: projectDir,
          engine: "sora-engine",
          author: response.config.author,
          description: response.config.description,
          settings: {
            resolution: response.config.settings.resolution,
            textSpeed: response.config.settings.text_speed,
            autoSaveInterval: response.config.settings.auto_save_interval,
            language: "en",
          },
          build: {
            outputFormat: "react-native",
            targetPlatforms: response.config.build.target_platforms,
          },
        },
        files: response.files,
      };
    } catch (error) {
      console.error("Open project error:", error);
      throw new Error("Failed to open project. Please make sure the selected file is a valid Sora project.");
    }
  }
}
