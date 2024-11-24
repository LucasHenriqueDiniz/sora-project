import { listen } from "@tauri-apps/api/event";
import { useEffect } from "react";
import { useLoadingStore } from "../stores/loadingStore";

export function useLoadingEvents() {
  const { updateProgress, updateMessage } = useLoadingStore();

  useEffect(() => {
    // Escuta eventos de progresso
    const unlistenProgress = listen("create-project-progress", (event: any) => {
      const { message, progress } = event.payload;
      if (message) updateMessage(message);
      if (progress !== undefined) updateProgress(progress);
    });

    return () => {
      unlistenProgress.then((unlistenFn) => unlistenFn());
    };
  }, [updateMessage, updateProgress]);
}
