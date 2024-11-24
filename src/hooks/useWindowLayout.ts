import { useState, useCallback, useEffect } from "react";
import { TabContainer, TabData, Layout } from "../types/editor";
import { invoke } from "@tauri-apps/api/core";

const MAX_TABS_PER_CONTAINER = 5;

export const useWindowLayout = () => {
  const [containers, setContainers] = useState<TabContainer[]>([{ id: "container1", tabs: [], activeTab: 0 }]);

  const [layouts, setLayouts] = useState({
    lg: [{ i: "container1", x: 0, y: 0, w: 12, h: 12 }],
  });

  useEffect(() => {
    // Load saved layout
    invoke<string>("load_layout").then((savedLayout) => {
      if (savedLayout) {
        try {
          const parsed = JSON.parse(savedLayout);
          setLayouts(parsed);
        } catch (e) {
          console.error("Failed to parse saved layout:", e);
        }
      }
    });
  }, []);

  const addTab = useCallback((tab: TabData) => {
    setContainers((prev) => {
      const availableContainer = prev.find((c) => c.tabs.length < MAX_TABS_PER_CONTAINER);

      if (availableContainer) {
        return prev.map((c) =>
          c.id === availableContainer.id
            ? {
                ...c,
                tabs: [...c.tabs, tab],
                activeTab: c.tabs.length,
              }
            : c
        );
      }

      // Create new container if needed
      const newContainer: TabContainer = {
        id: `container${prev.length + 1}`,
        tabs: [tab],
        activeTab: 0,
      };

      // Add new layout
      setLayouts((prevLayouts) => ({
        ...prevLayouts,
        lg: [
          ...prevLayouts.lg,
          {
            i: newContainer.id,
            x: (prevLayouts.lg.length % 2) * 6,
            y: Math.floor(prevLayouts.lg.length / 2) * 6,
            w: 6,
            h: 12,
          },
        ],
      }));

      return [...prev, newContainer];
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

      // Remove empty containers
      return newContainers.filter((c) => c.tabs.length > 0);
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

  const updateLayout = useCallback((newLayouts: any) => {
    setLayouts(newLayouts);
    invoke("save_layout", { layout: JSON.stringify(newLayouts) });
  }, []);

  return {
    containers,
    layouts,
    addTab,
    removeTab,
    moveTab,
    updateLayout,
  };
};
