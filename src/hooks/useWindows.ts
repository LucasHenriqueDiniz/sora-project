import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { TabData } from "../types/editor";
import { WindowManager } from "../services/windowManager";

export const useWindows = () => {
  const [windows, setWindows] = useState<string[]>([]);

  const createWindow = useCallback(async (tab: TabData) => {
    try {
      const window = await WindowManager.createNewWindow(tab);
      setWindows((prev) => [...prev, window.label]);
      return window;
    } catch (error) {
      console.error("Failed to create window:", error);
      return null;
    }
  }, []);

  const closeWindow = useCallback(async (label: string) => {
    try {
      await WindowManager.closeWindow(label);
      setWindows((prev) => prev.filter((w) => w !== label));
    } catch (error) {
      console.error("Failed to close window:", error);
    }
  }, []);

  return {
    windows,
    createWindow,
    closeWindow,
  };
};
