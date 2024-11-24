import React, { useEffect, useRef } from "react";
import { VscSplitHorizontal, VscSplitVertical, VscClose, VscWindow } from "react-icons/vsc";

interface TabContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onSplitVertical: () => void;
  onSplitHorizontal: () => void;
  onDetach: () => void;
  onClickOutside: () => void;
}

export const TabContextMenu: React.FC<TabContextMenuProps> = ({ x, y, onClose, onSplitVertical, onSplitHorizontal, onDetach, onClickOutside }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClickOutside();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClickOutside]);

  return (
    <div
      ref={menuRef}
      className="fixed bg-gray-800 border border-gray-700 rounded shadow-lg py-1 z-50"
      style={{ top: y, left: x }}
    >
      <button
        className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center gap-2"
        onClick={onSplitVertical}
      >
        <VscSplitVertical size={16} />
        Split Vertical
      </button>
      <button
        className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center gap-2"
        onClick={onSplitHorizontal}
      >
        <VscSplitHorizontal size={16} />
        Split Horizontal
      </button>
      <div className="border-t border-gray-700 my-1" />
      <button
        className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center gap-2"
        onClick={onDetach}
      >
        <VscWindow size={16} />
        Move to New Window
      </button>
      <div className="border-t border-gray-700 my-1" />
      <button
        className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center gap-2 text-red-400"
        onClick={onClose}
      >
        <VscClose size={16} />
        Close
      </button>
    </div>
  );
};
