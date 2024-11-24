import { invoke } from "@tauri-apps/api/core";
import { Window } from "@tauri-apps/api/window";

const mainWindow = new Window("main");

export const windowManager = {
  async maximize() {
    await mainWindow.maximize();
  },

  async unmaximize() {
    await mainWindow.unmaximize();
  },

  async minimize() {
    await mainWindow.minimize();
  },

  async close() {
    await mainWindow.close();
  },

  async isMaximized() {
    return await mainWindow.isMaximized();
  },

  async saveLayout(layout: string) {
    await invoke("save_layout", { layout });
  },

  async loadLayout(): Promise<string> {
    return await invoke("load_layout");
  },

  async createNewWindow(options: any) {
    const newWindow = new Window("new-window", options);
    return newWindow;
  },
};
