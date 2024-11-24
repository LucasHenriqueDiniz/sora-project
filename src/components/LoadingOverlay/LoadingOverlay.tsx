import "./LoadingOverlay.css";

interface LoadingOverlayProps {
  message: string;
  progress: number; // valor de 0 a 100
}

export function LoadingOverlay({ message, progress }: LoadingOverlayProps) {
  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <span className="loading-message">{message}</span>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="progress-text">{Math.round(progress)}%</span>
      </div>
    </div>
  );
}
