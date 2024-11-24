import { create } from "zustand";
import type { RecentProject } from "../types/project";
import { Store } from "@tauri-apps/plugin-store";

interface RecentProjectsState {
  recentProjects: RecentProject[];
  addRecentProject: (project: Omit<RecentProject, "lastOpened">) => Promise<void>;
  loadRecentProjects: () => Promise<void>;
  clearRecentProjects: () => Promise<void>;
}

let store: Store | null = null;

// Função para obter a instância do store
const getStore = async () => {
  if (!store) {
    store = await Store.load(".settings.dat");
  }
  return store;
};

export const useRecentProjectsStore = create<RecentProjectsState>((set) => ({
  recentProjects: [],

  addRecentProject: async (project) => {
    const store = await getStore();

    const newProject: RecentProject = {
      ...project,
      lastOpened: Date.now(),
    };

    set((state) => {
      const filteredProjects = state.recentProjects.filter((p) => p.path !== project.path).slice(0, 4);

      const updatedProjects = [newProject, ...filteredProjects];
      store.set("recentProjects", updatedProjects);
      store.save();

      return { recentProjects: updatedProjects };
    });
  },

  loadRecentProjects: async () => {
    const store = await getStore();
    const recentProjects = (await store.get<RecentProject[]>("recentProjects")) || [];
    set({ recentProjects });
  },

  clearRecentProjects: async () => {
    const store = await getStore();
    await store.delete("recentProjects");
    await store.save();
    set({ recentProjects: [] });
  },
}));
