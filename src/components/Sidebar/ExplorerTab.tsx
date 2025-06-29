import { invoke } from "@tauri-apps/api/core";
import { ChevronRight, FilePlus, Folder, FolderPlus, ChevronDown, FolderOpen } from "lucide-react";
import { useMemo, useState } from "react";
import { DraggingPosition, TreeItem as RCTTreeItem, StaticTreeDataProvider, Tree, UncontrolledTreeEnvironment, useTreeEnvironment } from "react-complex-tree";
import { useErrorModal } from "../../hooks/useErrorModal";
import { useFileSystem } from "../../hooks/useFileSystem";
import { useExplorerStore } from "../../stores/explorerStore";
import { useProjectStore } from "../../stores/projectStore";
import type { ProjectFile } from "../../types/project";
import { getFileIcon } from "../../utils/fileIcons";
import { TreeItemContextMenu } from "../ContextMenu/TreeItemContextMenu";
import { Button } from "../ui/button";

interface CustomTreeItem extends RCTTreeItem<string> {
  path: string;
  children: string[];
}

interface ExplorerTabProps {
  onFileSelect: (path: string, content: string) => void;
}

const ExplorerTab: React.FC<ExplorerTabProps> = ({ onFileSelect }) => {
  const { files, loadingFiles, projectPath, updateFileTree } = useProjectStore();
  const { createFolder, deleteFile, renameFile, moveFile } = useFileSystem();
  const { showError } = useErrorModal();
  const [selectedItem, setSelectedItem] = useState<CustomTreeItem | null>(null);
  const { expandedFolders } = useExplorerStore();

  const treeItems = useMemo(() => {
    const items: Record<string, CustomTreeItem> = {
      root: {
        index: "root",
        canMove: true,
        isFolder: true,
        children: [],
        data: projectPath || "Project Root",
        canRename: false,
        path: projectPath || "",
      },
    };

    const processFiles = (fileList: ProjectFile[], parentId: string) => {
      fileList.forEach((file) => {
        items[file.path] = {
          index: file.path,

          canMove: true,

          isFolder: file.type === "directory",

          children: file.children ? file.children.map((child) => child.path) : [],

          data: file.name,

          canRename: true,

          path: file.path,
        };

        if (parentId === "root") {
          items.root.children.push(file.path);
        }

        if (file.children) {
          processFiles(file.children, file.path);
        }
      });
    };

    if (files) {
      processFiles(files, "root");
    }

    return items;
  }, [files, projectPath]);

  const dataProvider = useMemo(() => {
    return new StaticTreeDataProvider(treeItems, (item: RCTTreeItem<string>, newName: string) => {
      const customItem = item as CustomTreeItem;

      return {
        ...customItem,

        data: newName,
      };
    });
  }, [treeItems]);

  const handleFileSelect = (item: RCTTreeItem<string>, treeId: string) => {
    const customItem = item as CustomTreeItem;

    setSelectedItem(customItem);

    if (customItem.isFolder) return;

    invoke<string>("read_file", { path: customItem.path })
      .then((content) => {
        onFileSelect(customItem.path, content);
      })

      .catch((error) => {
        showError("Failed to Read File", error instanceof Error ? error.message : String(error));
      });
  };

  const handleCreateFile = async () => {
    const targetPath = selectedItem?.isFolder ? selectedItem.path : selectedItem?.path.split("/").slice(0, -1).join("/") || projectPath;

    if (!targetPath) {
      showError("Error", "No valid location selected");

      return;
    }

    const fileName = prompt("Enter file name:");

    if (!fileName) return;

    try {
      await invoke("create_file", {
        parentPath: targetPath,
        tempName: fileName,
      });

      await updateFileTree();

      dataProvider.onDidChangeTreeDataEmitter.emit([targetPath]);
    } catch (error) {
      showError("Failed to Create File", error instanceof Error ? error.message : String(error));
    }
  };

  const handleCreateFolder = async () => {
    const targetPath = selectedItem?.isFolder ? selectedItem.path : selectedItem?.path.split("/").slice(0, -1).join("/") || projectPath;

    if (!targetPath) {
      showError("Error", "No valid location selected");

      return;
    }

    const folderName = prompt("Enter folder name:");

    if (!folderName) return;

    try {
      await createFolder(targetPath, folderName);

      await updateFileTree();

      dataProvider.onDidChangeTreeDataEmitter.emit([targetPath]);
    } catch (error) {
      showError("Failed to Create Folder", error instanceof Error ? error.message : String(error));
    }
  };

  const renderItemTitle = (props: { item: RCTTreeItem<string> }) => {
    const item = props.item as CustomTreeItem;
    const { viewState } = useTreeEnvironment();
    const isExpanded = viewState?.explorer?.expandedItems?.includes(item.index.toString());

    return (
      <TreeItemContextMenu
        path={item.path}
        isFolder={Boolean(item.isFolder)}
        onRename={() => {
          const newName = prompt("Enter new name:", item.data);
          if (newName && newName !== item.data) {
            renameFile(item.path, newName).catch((error) => {
              showError("Failed to Rename", error instanceof Error ? error.message : String(error));
            });
          }
        }}
        onDelete={() => {
          if (confirm(`Are you sure you want to delete ${item.data}?`)) {
            deleteFile(item.path, item.data).catch((error) => {
              showError("Failed to Delete", error instanceof Error ? error.message : String(error));
            });
          }
        }}
      >
        <div className={`flex items-center gap-2 min-w-0 ${!item.isFolder ? "ml-[6px]" : ""}`}>
          {item.isFolder ? isExpanded ? <FolderOpen className="h-4 w-4 flex-shrink-0 text-blue-400" /> : <Folder className="h-4 w-4 flex-shrink-0 text-blue-400" /> : getFileIcon(item.data)}
          <span className="truncate">{item.data}</span>
        </div>
      </TreeItemContextMenu>
    );
  };

  const renderItemArrow = ({ item }: { item: RCTTreeItem<string> }) => {
    const customItem = item as CustomTreeItem;
    const { viewState } = useTreeEnvironment();

    if (!customItem.isFolder) return null;

    const isExpanded = viewState?.explorer?.expandedItems?.includes(customItem.index.toString());

    return isExpanded ? <ChevronDown className="h-3 w-3 text-gray-400 mr-1" /> : <ChevronRight className="h-3 w-3 text-gray-400 mr-1" />;
  };

  if (!projectPath) {
    return <div className="px-4 py-2 text-sm text-gray-400">No project opened</div>;
  }

  if (loadingFiles) {
    return <div className="px-4 py-2 text-sm text-gray-400">Loading...</div>;
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="border-b border-gray-700">
        <div className="w-full px-4 py-2 flex items-center justify-between">
          <span className="text-sm">EXPLORER</span>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-gray-700"
              onClick={handleCreateFile}
            >
              <FilePlus className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-gray-700"
              onClick={handleCreateFolder}
            >
              <FolderPlus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="py-2">
          <UncontrolledTreeEnvironment<string>
            dataProvider={dataProvider}
            getItemTitle={(item) => item.data}
            renderItemTitle={renderItemTitle}
            // renderDepthOffset={4}
            renderItemArrow={renderItemArrow}
            viewState={{
              explorer: {
                expandedItems: Object.entries(expandedFolders)
                  .filter(([_, isExpanded]) => isExpanded)
                  .map(([path]) => path),
              },
            }}
            canDragAndDrop={true}
            canDropOnFolder={true}
            canReorderItems={true}
            canRename={true}
            canDropAt={(items, target) => {
              if (target.targetType === "item") {
                const targetItem = treeItems[target.targetItem];
                const sourceItem = items[0] as CustomTreeItem;
                if (!targetItem || !sourceItem) return false;
                if (targetItem.path === sourceItem.path) return false;
                if (sourceItem.isFolder && targetItem.path.startsWith(sourceItem.path)) return false;
                return Boolean(targetItem.isFolder);
              }
              return target.targetType === "root";
            }}
            onPrimaryAction={handleFileSelect}
            onFocusItem={(item) => setSelectedItem(item as CustomTreeItem)}
            onDrop={async (items, target: DraggingPosition) => {
              try {
                const item = items[0] as CustomTreeItem;
                if (target.targetType === "item") {
                  await moveFile(item.path, `${target.targetItem}/${item.data}`);
                } else if (target.targetType === "root") {
                  await moveFile(item.path, `${projectPath}/${item.data}`);
                }
                await updateFileTree();
              } catch (error) {
                showError("Failed to Move Item", error instanceof Error ? error.message : String(error));
              }
            }}
            onExpandItem={(item) => {
              useExplorerStore.getState().setExpanded(item.index.toString(), true);
            }}
            onCollapseItem={(item) => {
              useExplorerStore.getState().setExpanded(item.index.toString(), false);
            }}
          >
            <Tree
              treeId="explorer"
              rootItem="root"
            />
          </UncontrolledTreeEnvironment>
        </div>
      </div>
    </div>
  );
};

export default ExplorerTab;
