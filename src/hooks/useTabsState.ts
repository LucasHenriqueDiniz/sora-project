import { useState, useCallback } from "react";
import { TabData, TabContainer } from "../types/editor";
import { windowManager } from "../config/tauriConfig";

const MAX_TABS_PER_CONTAINER = 5;

export const useTabsState = () => {
  const [containers, setContainers] = useState<TabContainer[]>([{ id: "container1", tabs: [], activeTab: 0 }]);

  const addTab = useCallback((tab: TabData, containerId?: string) => {
    setContainers((prev) => {
      const targetContainer = containerId ? prev.find((c) => c.id === containerId) : prev.find((c) => c.tabs.length < MAX_TABS_PER_CONTAINER);

      if (!targetContainer) {
        // Create new container if no available container found
        const newContainer: TabContainer = {
          id: `container${prev.length + 1}`,
          tabs: [tab],
          activeTab: 0,
        };
        return [...prev, newContainer];
      }

      return prev.map((c) =>
        c.id === targetContainer.id
          ? {
              ...c,
              tabs: [...c.tabs, tab],
              activeTab: c.tabs.length,
            }
          : c
      );
    });
  }, []);

  const removeTab = useCallback((containerId: string, tabIndex: number) => {
    setContainers((prev) => {
      const newContainers = prev.map((c) =>
        c.id === containerId
          ? {
              ...c,
              tabs: c.tabs.filter((_, i) => i !== tabIndex),
              activeTab: Math.max(0, c.activeTab - 1),
            }
          : c
      );

      // Remove empty containers except the first one
      return newContainers.filter((c, i) => i === 0 || c.tabs.length > 0);
    });
  }, []);

  const moveTab = useCallback((sourceContainerId: string, targetContainerId: string, sourceIndex: number, targetIndex: number) => {
    setContainers((prev) => {
      const newContainers = [...prev];
      const sourceContainer = newContainers.find((c) => c.id === sourceContainerId);
      const targetContainer = newContainers.find((c) => c.id === targetContainerId);

      if (sourceContainer && targetContainer) {
        const [movedTab] = sourceContainer.tabs.splice(sourceIndex, 1);
        targetContainer.tabs.splice(targetIndex, 0, movedTab);
      }

      return newContainers;
    });
  }, []);

  const detachTab = useCallback(
    async (containerId: string, tabIndex: number) => {
      const container = containers.find((c) => c.id === containerId);
      if (!container) return;

      const tab = container.tabs[tabIndex];
      await windowManager.createNewWindow(tab);

      removeTab(containerId, tabIndex);
    },
    [containers, removeTab]
  );

  return {
    containers,
    addTab,
    removeTab,
    moveTab,
    detachTab,
  };
};
