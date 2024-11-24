import React, { useState } from "react";
import { VscFiles, VscSearch, VscTools } from "react-icons/vsc";
import ExplorerTab from "./ExplorerTab";
import SearchTab from "./SearchTab";
import ToolsTab from "./ToolsTab";

interface SidebarProps {
  onFileSelect: (path: string, content: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onFileSelect }) => {
  const [activeTab, setActiveTab] = useState<"files" | "search" | "tools">("files");

  return (
    <div className="h-full flex flex-col bg-sidebar-bg border-r border-gray-700">
      {/* Header */}
      <div className="h-10 border-b border-gray-700 flex items-center px-2">
        <button
          className={`p-2 rounded ${activeTab === "files" ? "bg-gray-700" : "hover:bg-gray-700"}`}
          onClick={() => setActiveTab("files")}
        >
          <VscFiles size={16} />
        </button>
        <button
          className={`p-2 rounded ${activeTab === "search" ? "bg-gray-700" : "hover:bg-gray-700"}`}
          onClick={() => setActiveTab("search")}
        >
          <VscSearch size={16} />
        </button>
        <button
          className={`p-2 rounded ${activeTab === "tools" ? "bg-gray-700" : "hover:bg-gray-700"}`}
          onClick={() => setActiveTab("tools")}
        >
          <VscTools size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === "files" && <ExplorerTab onFileSelect={onFileSelect} />}

        {activeTab === "tools" && <ToolsTab onFileSelect={onFileSelect} />}

        {activeTab === "search" && <SearchTab onFileSelect={onFileSelect} />}
      </div>
    </div>
  );
};

export default Sidebar;
