import React from "react";
import { VscClose } from "react-icons/vsc";
import { getFileIcon } from "../../utils/fileIcons";
import { Draggable } from "react-beautiful-dnd";

interface TabProps {
  id: string;
  title: string;
  path: string;
  index: number;
  isActive: boolean;
  onClose: (e: React.MouseEvent) => void;
  onClick: () => void;
}

const Tab: React.FC<TabProps> = ({ id, title, path, index, isActive, onClose, onClick }) => {
  return (
    <Draggable
      draggableId={id}
      index={index}
    >
      {(provided) => (
        <li
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`
            flex-shrink-0 px-3 py-2 flex items-center gap-2 border-r border-gray-700 
            hover:bg-gray-700 cursor-pointer min-w-[150px] max-w-[200px]
            ${isActive ? "bg-editor-bg" : ""}
          `}
        >
          {getFileIcon(path)}
          <span className="flex-1 truncate">{title}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose(e);
            }}
            className="ml-2 hover:text-red-500 flex-shrink-0"
          >
            <VscClose size={16} />
          </button>
        </li>
      )}
    </Draggable>
  );
};

export default Tab;
