import React from "react";
import { VscNewFile, VscFolderOpened, VscSave, VscSettings } from "react-icons/vsc";

interface MainMenuProps {
  onNewProject: () => void;
  onOpenProject: () => void;
  onSaveProject: () => void;
  onSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onNewProject, onOpenProject, onSaveProject, onSettings }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1 hover:bg-gray-700"
      >
        File
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-700 rounded shadow-lg py-1 min-w-[200px]">
          <button
            onClick={() => {
              setIsOpen(false);
              onNewProject();
            }}
            className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center gap-2"
          >
            <VscNewFile size={16} />
            New Project
            <span className="ml-auto text-gray-400 text-sm">Ctrl+N</span>
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              onOpenProject();
            }}
            className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center gap-2"
          >
            <VscFolderOpened size={16} />
            Open Project
            <span className="ml-auto text-gray-400 text-sm">Ctrl+O</span>
          </button>

          <div className="border-t border-gray-700 my-1" />

          <button
            onClick={() => {
              setIsOpen(false);
              onSaveProject();
            }}
            className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center gap-2"
          >
            <VscSave size={16} />
            Save Project
            <span className="ml-auto text-gray-400 text-sm">Ctrl+S</span>
          </button>

          <div className="border-t border-gray-700 my-1" />

          <button
            onClick={() => {
              setIsOpen(false);
              onSettings();
            }}
            className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center gap-2"
          >
            <VscSettings size={16} />
            Settings
          </button>
        </div>
      )}
    </div>
  );
};
