import { useState, useCallback } from "react";
import { TabData, TabContainer } from "../types/editor";
import { invoke } from "@tauri-apps/api/core";

export const useEditor = () => {
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [files, setFiles] = useState<{ [key: string]: string }>({});
  const [unsavedChanges, setUnsavedChanges] = useState<Set<string>>(new Set());

  const openFile = useCallback(async (path: string) => {
    try {
      const content = await invoke<string>("read_file", { path });
      setFiles((prev) => ({ ...prev, [path]: content }));
      setActiveFile(path);
      return content;
    } catch (error) {
      console.error("Failed to open file:", error);
      return null;
    }
  }, []);

  const saveFile = useCallback(async (path: string, content: string) => {
    try {
      await invoke("save_file", { path, content });
      setFiles((prev) => ({ ...prev, [path]: content }));
      setUnsavedChanges((prev) => {
        const next = new Set(prev);
        next.delete(path);
        return next;
      });
      return true;
    } catch (error) {
      console.error("Failed to save file:", error);
      return false;
    }
  }, []);

  const updateFile = useCallback((path: string, content: string) => {
    setFiles((prev) => ({ ...prev, [path]: content }));
    setUnsavedChanges((prev) => new Set(prev).add(path));
  }, []);

  return {
    activeFile,
    files,
    unsavedChanges,
    openFile,
    saveFile,
    updateFile,
  };
};
