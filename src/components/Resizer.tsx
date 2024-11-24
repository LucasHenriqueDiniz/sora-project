import React, { useCallback, useEffect, useState } from "react";

interface ResizerProps {
  onResize: (delta: number) => void;
  direction?: "horizontal" | "vertical";
  minSize?: number;
  maxSize?: number;
}

const Resizer: React.FC<ResizerProps> = ({ onResize, direction = "horizontal", minSize = 150, maxSize = Infinity }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      setStartPosition(direction === "horizontal" ? e.clientX : e.clientY);
    },
    [direction]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const currentPosition = direction === "horizontal" ? e.clientX : e.clientY;
      const delta = currentPosition - startPosition;

      onResize(delta);
      setStartPosition(currentPosition);
    },
    [isDragging, startPosition, direction, onResize]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      className={`
        ${direction === "horizontal" ? "cursor-col-resize w-1 hover:w-1.5" : "cursor-row-resize h-1 hover:h-1.5"}
        bg-gray-700 hover:bg-blue-500 transition-colors
        ${isDragging ? "bg-blue-500" : ""}
      `}
      onMouseDown={handleMouseDown}
    />
  );
};

export default Resizer;
