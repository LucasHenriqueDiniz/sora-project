import React, { useState } from "react";
import { VscFolderOpened, VscNewFile } from "react-icons/vsc";
import { CreateProjectModal } from "./CreateProjectModal/CreateProjectModal";
import { useProjectStore } from "../stores/projectStore";
import { open } from "@tauri-apps/plugin-dialog";
import { useCreateProject } from "../hooks/useCreateProject";
import { ProjectManager } from "../services/projectManager";
import { useLoadingStore } from "../stores/loadingStore";
import { useRecentProjectsStore } from "../stores/recentProjectsStore";
import { formatDistanceToNow } from "date-fns";
import { useErrorModal } from "../hooks/useErrorModal";

const WelcomeScreen: React.FC = () => {
  const { isModalOpen, openModal, closeModal } = useCreateProject();
  const { setFiles, setProjectPath, setProjectName } = useProjectStore();
  const { showLoading, hideLoading } = useLoadingStore();
  const { recentProjects, addRecentProject } = useRecentProjectsStore();
  const { showError } = useErrorModal();

  const handleOpenProject = async (soraFilePath?: string) => {
    try {
      showLoading("Opening project...");
      const project = await ProjectManager.openProject(soraFilePath);

      if (project) {
        setFiles(project.files);
        setProjectPath(project.config.path);
        setProjectName(project.config.name);

        // Adicionar aos projetos recentes
        await addRecentProject({
          name: project.config.name,
          path: soraFilePath || project.config.path,
        });
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
      <div className="flex items-center justify-center h-full bg-editor-bg text-gray-300">
        <div className="max-w-2xl w-full p-8">
          <h1 className="text-3xl font-bold mb-8 text-center">Welcome to Sora Project</h1>

          <div className="grid grid-cols-2 gap-8">
            <div
              className="p-6 border border-gray-700 rounded-lg hover:border-blue-500 cursor-pointer transition-colors duration-300"
              onClick={openModal}
            >
              <div className="flex items-center gap-3 mb-4">
                <VscNewFile className="text-2xl text-blue-500" />
                <h2 className="text-xl font-semibold">New Project</h2>
              </div>
              <p className="text-gray-400 text-sm">Create a new visual novel project with a basic structure</p>
            </div>

            <div
              className="p-6 border border-gray-700 rounded-lg hover:border-blue-500 cursor-pointer transition-colors duration-300"
              onClick={() => handleOpenProject()}
            >
              <div className="flex items-center gap-3 mb-4">
                <VscFolderOpened className="text-2xl text-blue-500" />
                <h2 className="text-xl font-semibold">Open Project</h2>
              </div>
              <p className="text-gray-400 text-sm">Open an existing project from your computer</p>
            </div>
          </div>

          <div className="mt-12">
            <h3 className="text-lg font-semibold mb-4">Recent Projects</h3>
            <div className="border border-gray-700 rounded-lg divide-y divide-gray-700">
              {recentProjects.length === 0 ? (
                <div className="p-4 text-gray-400 text-sm italic">No recent projects</div>
              ) : (
                recentProjects.map((project) => (
                  <div
                    key={project.path}
                    className="p-4 hover:bg-gray-700 cursor-pointer group"
                    onClick={() => handleOpenProject(project.path)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <VscFolderOpened className="text-blue-500" />
                        <div>
                          <h4 className="text-sm font-medium text-gray-200">{project.name}</h4>
                          <p className="text-xs text-gray-400">{project.path}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{formatDistanceToNow(project.lastOpened, { addSuffix: true })}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
};

export default WelcomeScreen;
