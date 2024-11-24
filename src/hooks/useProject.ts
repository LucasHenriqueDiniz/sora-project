import { useState, useCallback } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { Phase } from "../types/visualNovel";
import { invoke } from "@tauri-apps/api/core";

export const useProject = () => {
  const [projectPath, setProjectPath] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>("");
  const [currentPhase, setCurrentPhase] = useState<Phase | null>(null);

  const openProject = useCallback(async () => {
    try {
      // Use the dialog API from the new import
      const selected = (await open({
        directory: true,
        multiple: false,
        title: "Select Project Directory",
      })) as string | null;

      if (selected) {
        const name = selected.split("/").pop() || "Untitled Project";

        const projectFiles = await invoke<any>("read_project_files", {
          projectPath: selected,
        });

        setProjectPath(selected);
        setProjectName(name);
        // TODO: Parse project files and create Phase object
      }
    } catch (error) {
      console.error("Failed to open project:", error);
    }
  }, []);

  const saveProject = useCallback(async () => {
    if (!projectPath || !currentPhase) return;

    try {
      // Save each file type
      await invoke("save_file", {
        path: `${projectPath}/scenes.rpy`,
        content: "# Generated scenes",
      });

      await invoke("save_file", {
        path: `${projectPath}/characters.rpy`,
        content: "# Generated characters",
      });

      // TODO: Save other project files
    } catch (error) {
      console.error("Failed to save project:", error);
    }
  }, [projectPath, currentPhase]);

  return {
    projectPath,
    projectName,
    currentPhase,
    openProject,
    saveProject,
  };
};
