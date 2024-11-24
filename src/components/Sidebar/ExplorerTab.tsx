import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { useState, useEffect } from "react";
import { VscChevronDown, VscChevronRight, VscFolder, VscFolderOpened, VscNewFile, VscNewFolder } from "react-icons/vsc";
import { getFileIcon } from "../../utils/fileIcons";
import { useProjectStore } from "../../stores/projectStore";
import { invoke } from "@tauri-apps/api/core";
import { FileContextMenu } from "../ContextMenu/FileContextMenu";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useErrorModal } from "../../hooks/useErrorModal";
import { useFileSystem } from "../../hooks/useFileSystem";
import type { ProjectFile } from "../../types/project";
import { useExplorerStore } from "../../stores/explorerStore";
import { initDragFix } from "../../utils/dragFix";

interface FileTreeProps {
  files: ProjectFile[];
  onFileSelect: (path: string) => void;
  level?: number;
  activeFilePath?: string;
  onCreateFile?: (path: string) => void;
  creatingItemIn: { path: string; type: "file" | "folder" } | null;
  setCreatingItemIn: (value: { path: string; type: "file" | "folder" } | null) => void;
  newItemName: string;
  setNewItemName: (value: string) => void;
}

interface FileItemProps {
  file: ProjectFile;
  activeFilePath?: string;
  expandedFolders: Record<string, boolean>;
  handleToggleFolder: (path: string) => void;
  handleFileClick: (path: string) => void;
}

const FileItem: React.FC<FileItemProps> = ({ file, activeFilePath, expandedFolders, handleToggleFolder, handleFileClick }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: file.path,
    data: file,
  });

  const { isOver, setNodeRef: setDropRef } = useDroppable({
    id: file.path,
    data: file,
    disabled: file.type !== "directory",
  });

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        if (file.type === "directory") {
          setDropRef(node);
        }
      }}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation();
        file.type === "directory" ? handleToggleFolder(file.path) : handleFileClick(file.path);
      }}
      className={`
        flex items-center gap-1 px-2 py-1
        select-none cursor-default
        transition-colors duration-75
        ${file.path === activeFilePath ? "bg-gray-700" : "hover:bg-gray-700"}
        ${isDragging ? "opacity-50" : ""}
        ${file.type === "directory" && isOver ? "bg-blue-500/20 border border-blue-500" : ""}
      `}
    >
      <span className="flex items-center gap-1">
        {file.type === "directory" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleFolder(file.path);
            }}
            className="p-0.5"
          >
            {expandedFolders[file.path] ? <VscChevronDown size={16} /> : <VscChevronRight size={16} />}
          </button>
        )}
        {file.type === "directory" ? expandedFolders[file.path] ? <VscFolderOpened size={16} /> : <VscFolder size={16} /> : getFileIcon(file.path)}
        <span className="truncate">{file.name}</span>
      </span>
    </div>
  );
};

const FileTree: React.FC<FileTreeProps> = ({ files, onFileSelect, level = 0, activeFilePath, onCreateFile, creatingItemIn, setCreatingItemIn, newItemName, setNewItemName }) => {
  const { expandedFolders, toggleExpanded } = useExplorerStore();
  const { projectPath, updateFileTree } = useProjectStore();
  const { moveFile } = useFileSystem();
  const { showError } = useErrorModal();
  const [draggedItem, setDraggedItem] = useState<ProjectFile | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const draggedFile = files.find((f) => f.path === active.id);
    if (draggedFile) {
      setDraggedItem(draggedFile);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedItem(null);

    if (!over || active.id === over.id) return;

    const sourceFile = active.data.current as ProjectFile;
    const targetFile = over.data.current as ProjectFile;

    if (!targetFile || targetFile.type !== "directory") return;

    try {
      await moveFile(sourceFile.path, `${targetFile.path}/${sourceFile.name}`);
      await updateFileTree();
    } catch (error) {
      showError("Failed to Move Item", error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div style={{ paddingLeft: level * 4 }}>
        {files.map((file) => (
          <div key={file.path}>
            <FileContextMenu
              onRename={() => setCreatingItemIn({ path: file.path, type: "file" })}
              onDelete={() => {
                /* your existing delete logic */
              }}
              onDuplicate={() => {
                /* your existing duplicate logic */
              }}
            >
              <FileItem
                file={file}
                activeFilePath={activeFilePath}
                expandedFolders={expandedFolders}
                handleToggleFolder={toggleExpanded}
                handleFileClick={onFileSelect}
              />
            </FileContextMenu>

            {file.type === "directory" && expandedFolders[file.path] && file.children && (
              <FileTree
                files={file.children}
                onFileSelect={onFileSelect}
                level={level + 1}
                activeFilePath={activeFilePath}
                onCreateFile={onCreateFile}
                creatingItemIn={creatingItemIn}
                setCreatingItemIn={setCreatingItemIn}
                newItemName={newItemName}
                setNewItemName={setNewItemName}
              />
            )}

            {creatingItemIn?.path === file.path && (
              <div className="ml-8 mt-1">
                <Input
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      // Your existing create logic
                    } else if (e.key === "Escape") {
                      setCreatingItemIn(null);
                      setNewItemName("");
                    }
                  }}
                  autoFocus
                  className="h-6 text-sm"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <DragOverlay>
        {draggedItem && (
          <div className="opacity-50">
            <FileItem
              file={draggedItem}
              activeFilePath={activeFilePath}
              expandedFolders={expandedFolders}
              handleToggleFolder={toggleExpanded}
              handleFileClick={onFileSelect}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};

interface ExplorerTabProps {
  onFileSelect: (path: string, content: string) => void;
}

const ExplorerTab: React.FC<ExplorerTabProps> = ({ onFileSelect }) => {
  const { files, loadingFiles, projectPath, projectName, activeFile } = useProjectStore();
  const [sections, setSections] = useState({ explorer: true });
  const { createFolder } = useFileSystem();
  const { showError } = useErrorModal();
  const [creatingItemIn, setCreatingItemIn] = useState<{ path: string; type: "file" | "folder" } | null>(null);
  const [newItemName, setNewItemName] = useState("");

  const handleFileSelect = async (path: string) => {
    try {
      const content = await invoke<string>("read_file", { path });
      onFileSelect(path, content);
    } catch (error) {
      console.error("Failed to read file:", error);
      showError("Failed to Read File", error instanceof Error ? error.message : String(error));
    }
  };

  const handleCreateFile = () => {
    const targetPath = activeFile?.path || projectPath;
    if (!targetPath) return;

    setCreatingItemIn({ path: targetPath, type: "file" });
    setNewItemName("");
  };

  const handleCreateFolder = () => {
    const targetPath = activeFile?.path || projectPath;
    if (!targetPath) return;

    setCreatingItemIn({ path: targetPath, type: "folder" });
    setNewItemName("");
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="border-b border-gray-700">
        <div className="w-full px-4 py-2 flex items-center justify-between">
          <div className="flex items-center">
            {sections.explorer ? <VscChevronDown size={16} /> : <VscChevronRight size={16} />}
            <span className="ml-2 text-sm">EXPLORER</span>
          </div>
          {projectPath && (
            <div className="flex items-center gap-1 ">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-gray-700"
                onClick={handleCreateFile}
              >
                <VscNewFile size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-gray-700"
                onClick={handleCreateFolder}
              >
                <VscNewFolder size={16} />
              </Button>
            </div>
          )}
        </div>

        {sections.explorer && (
          <div className="py-2">
            {!projectPath ? (
              <div className="px-4 py-2 text-sm text-gray-400">No project opened</div>
            ) : loadingFiles ? (
              <div className="px-4 py-2 text-sm text-gray-400">Loading...</div>
            ) : files.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-400">Empty project</div>
            ) : (
              <FileTree
                files={files}
                onFileSelect={handleFileSelect}
                activeFilePath={activeFile?.path}
                onCreateFile={handleFileSelect}
                creatingItemIn={creatingItemIn}
                setCreatingItemIn={setCreatingItemIn}
                newItemName={newItemName}
                setNewItemName={setNewItemName}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorerTab;
