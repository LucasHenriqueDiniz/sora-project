import { useLoadingStore } from "../../stores/loadingStore";
import { LoadingOverlay } from "./LoadingOverlay";

export function LoadingOverlayContainer() {
  const { isLoading, message, progress } = useLoadingStore();

  if (!isLoading) return null;

  return (
    <LoadingOverlay
      message={message}
      progress={progress}
    />
  );
}
