import { create } from "zustand";

interface ExplorerStore {
  expandedFolders: Record<string, boolean>;
  toggleExpanded: (path: string) => void;
  setExpanded: (path: string, isExpanded: boolean) => void;
}

export const useExplorerStore = create<ExplorerStore>((set) => ({
  expandedFolders: {},
  toggleExpanded: (path) =>
    set((state) => ({
      expandedFolders: {
        ...state.expandedFolders,
        [path]: !state.expandedFolders[path],
      },
    })),
  setExpanded: (path, isExpanded) =>
    set((state) => ({
      expandedFolders: {
        ...state.expandedFolders,
        [path]: isExpanded,
      },
    })),
}));
