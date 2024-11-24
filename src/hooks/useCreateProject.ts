import { useState } from "react";
import { ProjectManager } from "../services/projectManager";
import { useLoadingStore } from "../stores/loadingStore";
import type { ProjectConfig } from "../types/project";

export function useCreateProject() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showLoading, hideLoading } = useLoadingStore();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleCreateProject = async (projectConfig: ProjectConfig) => {
    try {
      showLoading("Creating new project...");
      const project = await ProjectManager.createProject(projectConfig);
      closeModal();
      console.log(project);

      return project;
    } catch (error) {
      console.error("Failed to create project:", error);
      throw error;
    } finally {
      hideLoading();
    }
  };

  return {
    isModalOpen,
    openModal,
    closeModal,
    handleCreateProject,
  };
}
