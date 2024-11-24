import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { TabData } from "../types/editor";

export interface TabContainer {
  id: string;
  tabs: TabData[];
  activeTabIndex: number;
}

interface EditorState {
  containers: TabContainer[];
  activeContainer: string;
  // Actions
  addTab: (tab: TabData) => void;
  removeTab: (containerId: string, tabIndex: number) => void;
  setActiveTab: (containerId: string, tabIndex: number) => void;
  reorderTabs: (sourceContainerId: string, sourceIndex: number, targetContainerId: string, targetIndex: number) => void;
  splitContainer: (containerId: string, tabIndex: number, direction: "vertical" | "horizontal") => void;
  closeContainer: (containerId: string) => void;
  setContainers: (containers: TabContainer[]) => void;
  allTabs: () => TabData[];
}

export const useEditorStore = create<EditorState>()(
  devtools((set, get) => ({
    containers: [{ id: "main", tabs: [], activeTabIndex: 0 }],
    activeContainer: "main",
    allTabs: () => get().containers.flatMap((container) => container.tabs),
    addTab: (tab) =>
      set((state) => {
        const activeContainer = state.containers.find((c) => c.id === state.activeContainer);
        if (!activeContainer) return state;

        // Check if tab already exists in any container
        const existingTabContainer = state.containers.find((container) => container.tabs.some((t) => t.path === tab.path));

        if (existingTabContainer) {
          // Activate existing tab instead of creating a new one
          const tabIndex = existingTabContainer.tabs.findIndex((t) => t.path === tab.path);
          return {
            ...state,
            activeContainer: existingTabContainer.id,
            containers: state.containers.map((container) => (container.id === existingTabContainer.id ? { ...container, activeTabIndex: tabIndex } : container)),
          };
        }

        // Add new tab
        return {
          ...state,
          containers: state.containers.map((container) =>
            container.id === state.activeContainer
              ? {
                  ...container,
                  tabs: [...container.tabs, tab],
                  activeTabIndex: container.tabs.length,
                }
              : container
          ),
        };
      }),

    removeTab: (containerId, tabIndex) =>
      set((state) => {
        const container = state.containers.find((c) => c.id === containerId);
        if (!container) return state;

        const newTabs = container.tabs.filter((_, i) => i !== tabIndex);
        const newActiveTabIndex = Math.max(0, container.activeTabIndex - (tabIndex < container.activeTabIndex ? 1 : 0));

        if (newTabs.length === 0 && state.containers.length > 1) {
          // Remove empty container
          return {
            ...state,
            containers: state.containers.filter((c) => c.id !== containerId),
            activeContainer: state.containers[0].id,
          };
        }

        return {
          ...state,
          containers: state.containers.map((c) => (c.id === containerId ? { ...c, tabs: newTabs, activeTabIndex: newActiveTabIndex } : c)),
        };
      }),

    setActiveTab: (containerId, tabIndex) =>
      set((state) => ({
        ...state,
        activeContainer: containerId,
        containers: state.containers.map((container) => (container.id === containerId ? { ...container, activeTabIndex: tabIndex } : container)),
      })),

    reorderTabs: (sourceContainerId, sourceIndex, targetContainerId, targetIndex) =>
      set((state) => {
        const sourceContainer = state.containers.find((c) => c.id === sourceContainerId);
        const targetContainer = state.containers.find((c) => c.id === targetContainerId);

        if (!sourceContainer || !targetContainer) return state;

        const [movedTab] = sourceContainer.tabs.splice(sourceIndex, 1);
        targetContainer.tabs.splice(targetIndex, 0, movedTab);

        return {
          ...state,
          containers: state.containers.map((c) => {
            if (c.id === sourceContainerId) return sourceContainer;
            if (c.id === targetContainerId) return targetContainer;
            return c;
          }),
        };
      }),

    splitContainer: (containerId, tabIndex, direction) =>
      set((state) => {
        const container = state.containers.find((c) => c.id === containerId);
        if (!container) return state;

        const newContainerId = `container-${Date.now()}`;
        const [movedTab] = container.tabs.splice(tabIndex, 1);

        return {
          ...state,
          containers: [...state.containers, { id: newContainerId, tabs: [movedTab], activeTabIndex: 0 }],
        };
      }),

    closeContainer: (containerId) =>
      set((state) => ({
        ...state,
        containers: state.containers.filter((c) => c.id !== containerId),
        activeContainer: state.containers[0].id,
      })),

    setContainers: (containers) => set({ containers }),
  }))
);
