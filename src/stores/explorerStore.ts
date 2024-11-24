import { create } from "zustand";

interface ExplorerState {
  expandedFolders: Record<string, boolean>;
  setExpanded: (path: string, expanded: boolean) => void;
  toggleExpanded: (path: string) => void;
  clearExpanded: () => void;
}

export const useExplorerStore = create<ExplorerState>((set) => ({
  expandedFolders: {},
  setExpanded: (path, expanded) =>
    set((state) => ({
      expandedFolders: {
        ...state.expandedFolders,
        [path]: expanded,
      },
    })),
  toggleExpanded: (path) =>
    set((state) => ({
      expandedFolders: {
        ...state.expandedFolders,
        [path]: !state.expandedFolders[path],
      },
    })),
  clearExpanded: () => set({ expandedFolders: {} }),
}));
