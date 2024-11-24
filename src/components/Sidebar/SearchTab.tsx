import React from "react";
import { VscSearch, VscClose, VscChevronDown, VscNewFile, VscRefresh, VscFile, VscExclude } from "react-icons/vsc";

interface SidebarProps {
  onFileSelect: (path: string, content: string) => void;
}

const SearchTab: React.FC<SidebarProps> = ({ onFileSelect }) => {
  return (
    <div className="flex flex-col h-full bg-sidebar-bg text-gray-300">
      {/* Search Input Area */}
      <div className="p-3 border-b border-[#333]">
        <div className="flex items-center bg-input-bg rounded group">
          <div className="px-2 text-gray-500 group-focus-within:text-gray-300">
            <VscSearch size={16} />
          </div>
          <input
            type="text"
            placeholder="Search"
            className="flex-1 bg-transparent py-1.5 outline-none text-sm border-1 border-gray-700 rounded-md"
          />
          <button className="px-2 hover:bg-hover-bg rounded-r">
            <VscClose
              size={16}
              className="text-gray-500 hover:text-gray-300"
            />
          </button>
        </div>
      </div>

      {/* Files to Include/Exclude */}
      <div className="text-xs">
        <div className="p-3 border-b border-[#333]">
          <div className="flex items-center space-x-2 mb-2">
            <VscFile
              size={14}
              className="text-gray-500"
            />
            <span className="text-gray-300">files to include</span>
          </div>
          <input
            type="text"
            placeholder="e.g. *.ts, src/**/*, ..."
            className="flex-1 bg-transparent py-1.5 outline-none text-sm border-1 border-gray-700 rounded-md"
          />
        </div>

        <div className="p-3 border-b border-[#333]">
          <div className="flex items-center space-x-2 mb-2">
            <VscExclude
              size={14}
              className="text-gray-500"
            />
            <span className="text-gray-300">files to exclude</span>
          </div>
          <input
            type="text"
            placeholder="e.g. node_modules, *.test.ts, ..."
            className="flex-1 bg-transparent py-1.5 outline-none text-sm border-1 border-gray-700 rounded-md"
          />
        </div>
      </div>

      {/* Results Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Empty state */}
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <VscSearch
            size={48}
            className="mb-3 opacity-50"
          />
          <p className="text-sm">Search for text in your workspace</p>
          <p className="text-xs mt-1">Use * to match any text</p>
        </div>
      </div>
    </div>
  );
};

export default SearchTab;
