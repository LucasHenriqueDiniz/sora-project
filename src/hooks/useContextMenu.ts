import { useState, useCallback } from "react";

interface ContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

interface ContextMenuOptions {
  items: ContextMenuItem[];
}

export const useContextMenu = () => {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    options: ContextMenuOptions;
  } | null>(null);

  const showContextMenu = useCallback((event: React.MouseEvent, options: ContextMenuOptions) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      options,
    });
  }, []);

  const hideContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  return {
    contextMenu,
    showContextMenu,
    hideContextMenu,
  };
};
