import { useState, useCallback } from "react";
import { Layout, Layouts } from "react-grid-layout";

export const useGridLayout = () => {
  const [layouts, setLayouts] = useState<Layouts>({
    lg: [{ i: "container1", x: 0, y: 0, w: 12, h: 12 }],
  });

  const addContainer = useCallback((containerId: string) => {
    setLayouts((prev) => ({
      ...prev,
      lg: [
        ...prev.lg,
        {
          i: containerId,
          x: 0,
          y: prev.lg.length * 6,
          w: 6,
          h: 12,
        },
      ],
    }));
  }, []);

  const splitContainer = useCallback(
    (containerId: string, direction: "vertical" | "horizontal") => {
      setLayouts((prev) => {
        const currentContainer = prev.lg.find((item) => item.i === containerId);
        if (!currentContainer) return prev;

        const newContainerId = `container${prev.lg.length + 1}`;
        const { x, y, w, h } = currentContainer;

        if (direction === "vertical") {
          return {
            ...prev,
            lg: [...prev.lg.filter((item) => item.i !== containerId), { ...currentContainer, h: h / 2 }, { i: newContainerId, x, y: y + h / 2, w, h: h / 2 }],
          };
        } else {
          return {
            ...prev,
            lg: [...prev.lg.filter((item) => item.i !== containerId), { ...currentContainer, w: w / 2 }, { i: newContainerId, x: x + w / 2, y, w: w / 2, h }],
          };
        }
      });
      return `container${layouts.lg.length}`;
    },
    [layouts]
  );

  return {
    layouts,
    setLayouts,
    addContainer,
    splitContainer,
  };
};
