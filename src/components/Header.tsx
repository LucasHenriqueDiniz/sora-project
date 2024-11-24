import { Window } from "@tauri-apps/api/window";
import React, { useEffect } from "react";
import { VscChevronLeft, VscChevronRight, VscChromeClose, VscChromeMaximize, VscChromeMinimize, VscChromeRestore, VscMenu } from "react-icons/vsc";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useProjectStore } from "../stores/projectStore";
import { useCreateProject } from "../hooks/useCreateProject";
import { CreateProjectModal } from "./CreateProjectModal/CreateProjectModal";

interface HeaderProps {
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ showSidebar, setShowSidebar, onOpenSettings }) => {
  const [isMaximized, setIsMaximized] = React.useState(false);
  const { projectName, clearProject } = useProjectStore();
  const mainWindow = new Window("main");
  const { isModalOpen, openModal, closeModal } = useCreateProject();

  useEffect(() => {
    const checkMaximized = async () => {
      const maximized = await mainWindow.isMaximized();
      setIsMaximized(maximized);
    };
    checkMaximized();
  }, []);

  const handleMaximize = async () => {
    try {
      if (isMaximized) {
        await mainWindow.unmaximize();
      } else {
        await mainWindow.maximize();
      }
      setIsMaximized(!isMaximized);
    } catch (error) {
      console.error("Failed to maximize/unmaximize window:", error);
    }
  };

  const handleMinimize = async () => {
    try {
      await mainWindow.minimize();
    } catch (error) {
      console.error("Failed to minimize window:", error);
    }
  };

  const handleClose = async () => {
    try {
      await mainWindow.close();
    } catch (error) {
      console.error("Failed to close window:", error);
    }
  };

  const handleDoubleClick = async () => {
    try {
      if (isMaximized) {
        await mainWindow.unmaximize();
      } else {
        await mainWindow.maximize();
      }
      setIsMaximized(!isMaximized);
    } catch (error) {
      console.error("Failed to toggle maximize on double click:", error);
    }
  };

  const handleNewProject = () => {
    openModal();
  };

  const handleOpenProject = () => {
    console.log("Open project");
  };

  const handleCloseProject = () => {
    clearProject();
  };

  return (
    <>
      <div
        className="h-8 bg-header-bg flex items-center justify-between select-none"
        data-tauri-drag-region
        onDoubleClick={handleDoubleClick}
      >
        <div className="flex items-center space-x-2 px-2 relative z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-gray-400 hover:text-white p-1">
                <VscMenu size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem onClick={handleNewProject}>New Project</DropdownMenuItem>
              <DropdownMenuItem onClick={handleOpenProject}>Open Project</DropdownMenuItem>
              {projectName && <DropdownMenuItem onClick={handleCloseProject}>Close Project</DropdownMenuItem>}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onOpenSettings}>Settings</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="text-gray-400 hover:text-white p-1 relative z-10"
          >
            {showSidebar ? <VscChevronLeft size={16} /> : <VscChevronRight size={16} />}
          </button>
        </div>

        <div
          className="flex-1 text-center text-gray-300 text-sm font-medium"
          data-tauri-drag-region
        >
          {projectName || "Welcome to Sora Project"}
        </div>

        <div className="flex relative z-10">
          <button
            onClick={handleMinimize}
            className="hover:bg-gray-700 p-2"
          >
            <VscChromeMinimize size={16} />
          </button>
          <button
            onClick={handleMaximize}
            className="hover:bg-gray-700 p-2"
          >
            {isMaximized ? <VscChromeRestore size={16} /> : <VscChromeMaximize size={16} />}
          </button>
          <button
            onClick={handleClose}
            className="hover:bg-red-500 hover:text-white p-2"
          >
            <VscChromeClose size={16} />
          </button>
        </div>
      </div>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
};

export default Header;
