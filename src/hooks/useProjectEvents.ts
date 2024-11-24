import { useProjectStore } from "../stores/projectStore";
import { invoke } from "@tauri-apps/api/core";

export const useProjectEvents = () => {
  const { setActiveFile, updateFileTree } = useProjectStore();

  const createNewFile = async (parentPath: string) => {
    try {
      // Criar arquivo temporário no diretório correto
      const tempFileName = "untitled";
      const fullPath = `${parentPath}/${tempFileName}`;

      // Adicionar ao estado como "renomeando"
      setActiveFile({
        path: fullPath,
        isRenaming: true,
        isNew: true,
      });

      // Atualizar a árvore de arquivos para mostrar o novo arquivo
      await updateFileTree();

      return fullPath;
    } catch (error) {
      console.error("Failed to create new file:", error);
      throw error;
    }
  };

  const confirmNewFileName = async (tempPath: string, newName: string) => {
    try {
      await invoke("rename_file", {
        path: tempPath,
        newName,
      });

      // Atualizar a árvore de arquivos após a renomeação
      await updateFileTree();

      // Limpar o estado de renomeação
      setActiveFile({
        path: `${tempPath}/${newName}`,
        isRenaming: false,
        isNew: false,
      });
    } catch (error) {
      console.error("Failed to rename new file:", error);
      throw error;
    }
  };

  return {
    createNewFile,
    confirmNewFileName,
  };
};
