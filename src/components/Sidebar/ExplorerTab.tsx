import { useState } from "react";
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
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";

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

interface MoveConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  sourceFile: ProjectFile | null;
  targetFile: ProjectFile | null;
}

const MoveConfirmationDialog = ({ isOpen, onClose, onConfirm, sourceFile, targetFile }: MoveConfirmationDialogProps) => {
  if (!sourceFile || !targetFile) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move Confirmation</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>
            Are you sure you want to move "{sourceFile.name}" to "{targetFile.name}"?
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button onClick={onConfirm}>Move</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const FileTree: React.FC<FileTreeProps> = ({ files, onFileSelect, level = 0, activeFilePath, creatingItemIn, setCreatingItemIn, newItemName, setNewItemName }) => {
  const { expandedFolders, toggleExpanded } = useExplorerStore();
  const { createFolder, deleteFile, renameFile, moveFile } = useFileSystem();
  const { setActiveFile, updateFileTree } = useProjectStore();
  const { showError } = useErrorModal();
  const [draggedItem, setDraggedItem] = useState<ProjectFile | null>(null);
  const [moveConfirmation, setMoveConfirmation] = useState<{
    isOpen: boolean;
    sourceFile: ProjectFile | null;
    targetFile: ProjectFile | null;
  }>({
    isOpen: false,
    sourceFile: null,
    targetFile: null,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
        delay: 0,
        tolerance: 0,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const draggedFile = files.find((f) => f.path === active.id);
    if (draggedFile) {
      setDraggedItem(draggedFile);
      document.body.classList.add("dragging");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    document.body.classList.remove("dragging");
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const sourceFile = active.data.current as ProjectFile;
      const targetFile = over.data.current as ProjectFile;

      if (sourceFile && targetFile && targetFile.type === "directory") {
        setMoveConfirmation({
          isOpen: true,
          sourceFile,
          targetFile,
        });
      }
    }
    setDraggedItem(null);
  };

  const handleMoveConfirm = async () => {
    const { sourceFile, targetFile } = moveConfirmation;
    if (!sourceFile || !targetFile) return;

    try {
      await moveFile(sourceFile.path, `${targetFile.path}/${sourceFile.name}`);
      await updateFileTree();
    } catch (error) {
      showError("Failed to Move Item", error instanceof Error ? error.message : String(error));
    } finally {
      setMoveConfirmation({
        isOpen: false,
        sourceFile: null,
        targetFile: null,
      });
    }
  };

  const handleFileClick = (path: string) => {
    onFileSelect(path);
    setActiveFile({ path, isRenaming: false, isNew: false });
  };

  const handleToggleFolder = (path: string) => {
    toggleExpanded(path);
    setActiveFile({ path, isRenaming: false, isNew: false });
  };

  const handleDelete = async (path: string) => {
    try {
      const name = path.split("/").pop() || "";
      await deleteFile(path, name);
      await updateFileTree();
    } catch (error) {
      showError("Failed to Delete", error instanceof Error ? error.message : String(error));
    }
  };

  const handleRename = async (oldPath: string, newName: string): Promise<void> => {
    try {
      await renameFile(oldPath, newName);
      await updateFileTree();
    } catch (error) {
      showError("Failed to Rename", error instanceof Error ? error.message : String(error));
    }
  };

  const handleCreateItem = async () => {
    if (!creatingItemIn || !newItemName.trim()) {
      setCreatingItemIn(null);
      setNewItemName("");
      return;
    }

    try {
      if (creatingItemIn.type === "file") {
        await invoke("create_file", {
          parentPath: creatingItemIn.path,
          tempName: newItemName,
        });
      } else {
        await createFolder(creatingItemIn.path, newItemName);
      }
      await updateFileTree();
    } catch (error) {
      showError(`Failed to Create ${creatingItemIn.type}`, error instanceof Error ? error.message : String(error));
    } finally {
      setCreatingItemIn(null);
      setNewItemName("");
    }
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div style={{ paddingLeft: level * 4 }}>
          {files.map((file) => {
            const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
              id: file.path,
              data: file,
            });

            const { setNodeRef: setDropRef, isOver } = useDroppable({
              id: file.path,
              data: file,
              disabled: file.type !== "directory",
            });

            return (
              <div key={file.path}>
                <FileContextMenu
                  onRename={(newName) => handleRename(file.path, newName)}
                  onDelete={() => handleDelete(file.path)}
                  onDuplicate={() => {}}
                >
                  <div
                    ref={(node) => {
                      setNodeRef(node);
                      if (file.type === "directory") {
                        setDropRef(node);
                      }
                    }}
                    {...listeners}
                    {...attributes}
                    style={{ touchAction: "none" }}
                    className={`
                      flex items-center gap-1 px-2 py-1
                      select-none cursor-grab active:cursor-grabbing
                      ${file.path === activeFilePath ? "bg-gray-700" : "hover:bg-gray-700"}
                      ${isDragging ? "opacity-50 ring-2 ring-blue-500" : ""}
                      ${isOver ? "bg-blue-500/20 border-2 border-blue-500" : ""}
                    `}
                    onClick={() => (file.type === "directory" ? handleToggleFolder(file.path) : handleFileClick(file.path))}
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
                </FileContextMenu>

                {file.type === "directory" && (
                  <>
                    {creatingItemIn?.path === file.path && (
                      <div className="ml-8 mt-1 flex items-center gap-2">
                        {creatingItemIn.type === "file" ? <span className="ml-4">{getFileIcon(newItemName || "new-file.txt")}</span> : <VscFolder className="text-blue-400" />}
                        <Input
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                          onBlur={handleCreateItem}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleCreateItem();
                            if (e.key === "Escape") {
                              setCreatingItemIn(null);
                              setNewItemName("");
                            }
                          }}
                          placeholder={creatingItemIn.type === "file" ? "filename.ext" : "folder-name"}
                          autoFocus
                          className="h-6 py-0 px-1"
                        />
                      </div>
                    )}
                    {expandedFolders[file.path] && file.children && (
                      <FileTree
                        files={file.children}
                        onFileSelect={onFileSelect}
                        level={level + 1}
                        activeFilePath={activeFilePath}
                        creatingItemIn={creatingItemIn}
                        setCreatingItemIn={setCreatingItemIn}
                        newItemName={newItemName}
                        setNewItemName={setNewItemName}
                      />
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {draggedItem && (
            <div className="fixed pointer-events-none flex items-center gap-1 px-3 py-2 bg-gray-800 rounded-lg shadow-xl border border-gray-600">
              {draggedItem.type === "directory" ? <VscFolder className="text-blue-400" /> : getFileIcon(draggedItem.name)}
              <span className="text-sm text-white">{draggedItem.name}</span>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <MoveConfirmationDialog
        isOpen={moveConfirmation.isOpen}
        onClose={() => setMoveConfirmation({ isOpen: false, sourceFile: null, targetFile: null })}
        onConfirm={handleMoveConfirm}
        sourceFile={moveConfirmation.sourceFile}
        targetFile={moveConfirmation.targetFile}
      />
    </>
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
    const targetPath = activeFile?.path && files.find((f) => f.path === activeFile.path)?.type === "directory" ? activeFile.path : projectPath;

    if (!targetPath) {
      showError("Error", "No valid location selected");
      return;
    }

    if (targetPath !== projectPath) {
      useExplorerStore.getState().toggleExpanded(targetPath);
    }

    setCreatingItemIn({ path: targetPath, type: "file" });
    setNewItemName("");
  };

  const handleCreateFolder = () => {
    const targetPath = activeFile?.path && files.find((f) => f.path === activeFile.path)?.type === "directory" ? activeFile.path : projectPath;

    if (!targetPath) {
      showError("Error", "No valid location selected");
      return;
    }

    if (targetPath !== projectPath) {
      useExplorerStore.getState().toggleExpanded(targetPath);
    }

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
            <div className="flex items-center gap-1">
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
