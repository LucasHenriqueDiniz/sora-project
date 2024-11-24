import { Window } from "@tauri-apps/api/window";
import { TabData } from "../types/editor";

export class WindowManager {
  static async createNewWindow(tab: TabData) {
    const label = `window-${Date.now()}`;
    const currentWindow = Window.getCurrent();
    const { x, y } = await currentWindow.outerPosition();
    const { width, height } = await currentWindow.outerSize();

    const windowOptions = {
      label,
      title: tab.title,
      width: Math.floor(width * 0.8),
      height: Math.floor(height * 0.8),
      x: x + 50,
      y: y + 50,
      decorations: false,
      transparent: true,
      data: tab,
    };

    const webview = new Window(label, windowOptions);
    await webview.once("tauri://created", () => {
      console.log("Window created:", label);
    });

    return webview;
  }

  static async closeWindow(label: string) {
    const window = await Window.getByLabel(label);
    if (window) {
      await window.close();
    }
  }

  static async focusWindow(label: string) {
    const window = await Window.getByLabel(label);
    if (window) {
      await window.setFocus();
    }
  }

  static async detachTab(tab: TabData) {
    return await this.createNewWindow(tab);
  }
}
