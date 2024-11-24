import { ProjectManager } from "../services/projectManager";
import { useLoadingStore } from "../stores/loadingStore";
import { Button } from "./ui/button";
import { useCreateProject } from "../hooks/useCreateProject";
import { CreateProjectModal } from "./CreateProjectModal/CreateProjectModal";
import { useProjectStore } from "../stores/projectStore";
import type { ProjectFile } from "../types/project";
import { useErrorModal } from "../hooks/useErrorModal";

export function ProjectActions() {
  const { showLoading, hideLoading } = useLoadingStore();
  const { setFiles, setProjectPath, setProjectName } = useProjectStore();
  const { isModalOpen, openModal, closeModal } = useCreateProject();
  const { showError } = useErrorModal();

  const handleOpenProject = async () => {
    try {
      showLoading("Opening project...");
      const project = await ProjectManager.openProject();

      if (project) {
        setFiles(project.files);
        setProjectPath(project.config.path);
        setProjectName(project.config.name);
      }
    } catch (error) {
      console.error("Failed to open project:", error);
      showError("Failed to Open Project", error instanceof Error ? error.message : String(error));
    } finally {
      hideLoading();
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button onClick={openModal}>New Project</Button>
        <Button
          onClick={handleOpenProject}
          variant="secondary"
        >
          Open Project
        </Button>
      </div>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
}
