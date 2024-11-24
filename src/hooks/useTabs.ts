import { useState, useCallback } from "react";
import { TabContainer } from "../types/editor";
import { TabData } from "../types/editor";

export const useTabs = (maxTabsPerContainer: number = 5) => {
  const [containers, setContainers] = useState<TabContainer[]>([{ id: "container1", tabs: [], activeTab: 0 }]);

  const addTab = useCallback(
    (tab: TabData, containerId?: string) => {
      setContainers((prev) => {
        const newContainers = [...prev];
        const targetContainer = containerId ? newContainers.find((c) => c.id === containerId) : newContainers.find((c) => c.tabs.length < maxTabsPerContainer);

        if (targetContainer) {
          targetContainer.tabs.push(tab);
          targetContainer.activeTab = targetContainer.tabs.length - 1;
        }

        return newContainers;
      });
    },
    [maxTabsPerContainer]
  );

  const removeTab = useCallback((containerId: string, tabIndex: number) => {
    setContainers((prev) =>
      prev.map((c) =>
        c.id === containerId
          ? {
              ...c,
              tabs: c.tabs.filter((_: TabData, i: number) => i !== tabIndex),
              activeTab: Math.max(0, c.activeTab - 1),
            }
          : c
      )
    );
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

  return {
    containers,
    setContainers,
    addTab,
    removeTab,
    moveTab,
  };
};
