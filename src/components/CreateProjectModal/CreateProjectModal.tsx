import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ProjectConfig } from "../../types/project";
import { useState } from "react";
import { ProjectManager } from "../../services/projectManager";
import { useProjectStore } from "../../stores/projectStore";
import { useLoadingStore } from "../../stores/loadingStore";
import { open } from "@tauri-apps/plugin-dialog";
import { useErrorModal } from "../../hooks/useErrorModal";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const defaultConfig: ProjectConfig = {
  name: "",
  path: "",
  engine: "sora-engine",
  author: "",
  description: "",
  settings: {
    resolution: {
      width: 1920,
      height: 1080,
    },
    textSpeed: 30,
    autoSaveInterval: 300,
    language: "en",
  },
  build: {
    outputFormat: "react-native",
    targetPlatforms: ["android", "ios"],
  },
};

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const { setFiles, setProjectPath, setProjectName } = useProjectStore();
  const { showLoading, hideLoading } = useLoadingStore();
  const { showError } = useErrorModal();
  const [projectConfig, setProjectConfig] = useState<ProjectConfig>(defaultConfig);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleSelectPath = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Select Project Location",
      });

      if (selected) {
        setProjectConfig((prev) => ({
          ...prev,
          path: selected as string,
        }));
      }
    } catch (error) {
      console.error("Failed to select path:", error);
      showError("Failed to Select Project Location", error instanceof Error ? error.message : String(error));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!projectConfig.name.trim()) {
      errors.name = "Project name is required";
    }
    if (!projectConfig.path) {
      errors.path = "Project location is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    setFormErrors({});

    if (!validateForm()) {
      return;
    }

    try {
      onClose();
      showLoading("Creating new project...");

      const request: ProjectConfig = {
        ...projectConfig,
        engine: "sora-engine",
        settings: {
          resolution: {
            width: projectConfig.settings.resolution.width,
            height: projectConfig.settings.resolution.height,
          },
          textSpeed: projectConfig.settings.textSpeed,
          autoSaveInterval: projectConfig.settings.autoSaveInterval,
          language: projectConfig.settings.language,
        },
        build: {
          outputFormat: "react-native",
          targetPlatforms: ["android", "ios"],
        },
      };

      const project = await ProjectManager.createProject(request);

      if (project) {
        setFiles(project.files);
        setProjectPath(project.config.path);
        setProjectName(project.config.name);
        hideLoading();
      }
    } catch (error) {
      console.error("Failed to create project:", error);
      hideLoading();
      showError("Project Creation Failed", error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={onClose}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                value={projectConfig.name}
                onChange={(e) => {
                  setProjectConfig((prev) => ({ ...prev, name: e.target.value }));
                  if (formErrors.name) {
                    setFormErrors((prev) => ({ ...prev, name: "" }));
                  }
                }}
                placeholder="My Visual Novel"
                className={formErrors.name ? "border-red-500" : ""}
              />
              {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="path">Project Location *</Label>
              <div className="flex gap-2">
                <Input
                  id="path"
                  value={projectConfig.path}
                  readOnly
                  placeholder="Select project location..."
                  className={formErrors.path ? "border-red-500" : ""}
                />
                <Button
                  onClick={handleSelectPath}
                  variant="secondary"
                >
                  Browse
                </Button>
              </div>
              {formErrors.path && <p className="text-sm text-red-500">{formErrors.path}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={projectConfig.author}
                onChange={(e) => setProjectConfig((prev) => ({ ...prev, author: e.target.value }))}
                placeholder="Your name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={projectConfig.description}
                onChange={(e) => setProjectConfig((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Project description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Resolution</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={projectConfig.settings.resolution.width}
                    onChange={(e) =>
                      setProjectConfig((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          resolution: {
                            ...prev.settings.resolution,
                            width: parseInt(e.target.value),
                          },
                        },
                      }))
                    }
                    placeholder="Width"
                  />
                  <Input
                    type="number"
                    value={projectConfig.settings.resolution.height}
                    onChange={(e) =>
                      setProjectConfig((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          resolution: {
                            ...prev.settings.resolution,
                            height: parseInt(e.target.value),
                          },
                        },
                      }))
                    }
                    placeholder="Height"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Language</Label>
                <Select
                  value={projectConfig.settings.language}
                  onValueChange={(value) =>
                    setProjectConfig((prev) => ({
                      ...prev,
                      settings: { ...prev.settings, language: value as "en" | "pt-br" },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="pt-br">Portuguese (BR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Create Project</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
