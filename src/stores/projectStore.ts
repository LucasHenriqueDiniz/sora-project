import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import type { ProjectFile, ProjectResponse } from "../types/project";

interface ProjectStore {
  projectPath: string | null;
  projectName: string | null;
  files: ProjectFile[];
  loadingFiles: boolean;
  fileCache: Map<string, string>;
  activeFile: {
    path: string;
    isRenaming: boolean;
    isNew: boolean;
  } | null;
  setProjectPath: (path: string) => void;
  setProjectName: (name: string) => void;
  setFiles: (files: ProjectFile[]) => void;
  setLoadingFiles: (loading: boolean) => void;
  addToCache: (path: string, content: string) => void;
  getFromCache: (path: string) => string | undefined;
  setActiveFile: (file: { path: string; isRenaming: boolean; isNew: boolean } | null) => void;
  createNewFile: (parentPath: string) => Promise<void>;
  updateFileTree: () => Promise<void>;
  clearProject: () => void;
  createDirectory: (parentPath: string) => Promise<void>;
  deletePath: (path: string) => Promise<void>;
  renamePath: (oldPath: string, newName: string) => Promise<void>;
}

// Helper para normalizar caminhos
const normalizePath = (path: string) => path.replace(/\\/g, "/");

// Helper para normalizar arquivos recursivamente
const normalizeFiles = (files: ProjectFile[]): ProjectFile[] => {
  return files.map((file) => ({
    ...file,
    path: normalizePath(file.path),
    children: file.children ? normalizeFiles(file.children) : undefined,
  }));
};

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projectPath: null,
  projectName: null,
  files: [],
  loadingFiles: false,
  fileCache: new Map(),
  activeFile: null,

  setProjectPath: async (path) => {
    const normalizedPath = normalizePath(path);
    set({ projectPath: normalizedPath });
    const store = get();
    if (normalizedPath) {
      await store.updateFileTree();
    }
  },

  setProjectName: (name) => set({ projectName: name }),
  setFiles: (files) => {
    console.log("Setting files:", files);
    const normalizedFiles = normalizeFiles(files);
    console.log("Normalized files:", normalizedFiles);
    set({ files: normalizedFiles });
  },
  setLoadingFiles: (loading) => set({ loadingFiles: loading }),
  addToCache: (path, content) => {
    const cache = get().fileCache;
    cache.set(path, content);
    set({ fileCache: new Map(cache) });
  },
  getFromCache: (path) => get().fileCache.get(path),
  setActiveFile: (file) => set({ activeFile: file }),
  clearProject: () =>
    set({
      projectPath: null,
      projectName: null,
      files: [],
      activeFile: null,
      fileCache: new Map(),
    }),

  createNewFile: async (parentPath: string) => {
    try {
      const tempFileName = "untitled";
      const fullPath = `${parentPath}/${tempFileName}`;

      await invoke("create_file", {
        parentPath,
        tempName: tempFileName,
      });

      set({ activeFile: { path: fullPath, isRenaming: true, isNew: true } });
      await get().updateFileTree();
    } catch (error) {
      console.error("Failed to create new file:", error);
      throw error;
    }
  },

  updateFileTree: async () => {
    const { projectPath } = get();
    if (!projectPath) return;

    set({ loadingFiles: true });
    try {
      console.log("Updating file tree for path:", projectPath);
      const soraFile = await invoke<string>("find_sora_file", { projectPath });
      console.log("Found .sora file:", soraFile);

      const response = await invoke<ProjectResponse>("read_project_files", {
        projectPath: soraFile,
      });
      console.log("Received files:", response.files);

      const normalizedFiles = normalizeFiles(response.files);
      console.log("Normalized files to set:", normalizedFiles);

      set({ files: normalizedFiles });
    } catch (error) {
      console.error("Failed to update file tree:", error);
    } finally {
      set({ loadingFiles: false });
    }
  },

  createDirectory: async (parentPath: string) => {
    try {
      await invoke("create_directory", { path: parentPath });
      await get().updateFileTree();
    } catch (error) {
      console.error("Failed to create directory:", error);
      throw error;
    }
  },

  deletePath: async (path: string) => {
    try {
      await invoke("delete_path", { path });
      await get().updateFileTree();
    } catch (error) {
      console.error("Failed to delete path:", error);
      throw error;
    }
  },

  renamePath: async (oldPath: string, newName: string) => {
    try {
      await invoke("rename_path", { oldPath, newName });
      await get().updateFileTree();
    } catch (error) {
      console.error("Failed to rename path:", error);
      throw error;
    }
  },
}));
