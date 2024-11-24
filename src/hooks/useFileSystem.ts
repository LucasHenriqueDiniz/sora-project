import { invoke } from "@tauri-apps/api/core";
import { useProjectStore } from "../stores/projectStore";
import { useActionsStore } from "../stores/actionsStore";
import { useErrorModal } from "./useErrorModal";

export function useFileSystem() {
  const { updateFileTree } = useProjectStore();
  const { addAction } = useActionsStore();
  const { showError } = useErrorModal();

  const createFolder = async (parentPath: string, name: string) => {
    try {
      addAction("info", `Creating folder: ${name}`);
      await invoke("create_folder", { path: parentPath, name });
      await updateFileTree();
      addAction("success", `Folder created: ${name}`);
    } catch (error) {
      addAction("error", `Failed to create folder: ${name}`);
      showError("Failed to Create Folder", error instanceof Error ? error.message : String(error));
    }
  };

  const deleteFile = async (path: string, name: string) => {
    try {
      addAction("info", `Deleting: ${name}`);
      await invoke("delete_file", { path });
      await updateFileTree();
      addAction("success", `Deleted: ${name}`);
    } catch (error) {
      addAction("error", `Failed to delete: ${name}`);
      showError("Failed to Delete", error instanceof Error ? error.message : String(error));
    }
  };

  const moveFile = async (sourcePath: string, destinationPath: string) => {
    try {
      const fileName = sourcePath.split("/").pop();
      addAction("info", `Moving: ${fileName}`);
      await invoke("move_file", { source: sourcePath, destination: destinationPath });
      await updateFileTree();
      addAction("success", `Moved: ${fileName}`);
    } catch (error) {
      addAction("error", `Failed to move file`);
      showError("Failed to Move", error instanceof Error ? error.message : String(error));
    }
  };

  const renameFile = async (oldPath: string, newName: string) => {
    try {
      addAction("info", `Renaming to: ${newName}`);
      await invoke("rename_path", { oldPath, newName });
      await updateFileTree();
      addAction("success", `Renamed to: ${newName}`);
    } catch (error) {
      addAction("error", `Failed to rename to: ${newName}`);
      showError("Failed to Rename", error instanceof Error ? error.message : String(error));
    }
  };

  return {
    createFolder,
    deleteFile,
    moveFile,
    renameFile,
  };
}
