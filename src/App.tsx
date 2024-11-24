import React, { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import Header from "./components/Header";
import TabBar from "./components/TabBar/TabBar";
import Sidebar from "./components/Sidebar/Sidebar";
import WelcomeScreen from "./components/WelcomeScreen";
import Resizer from "./components/Resizer";
import { useEditorStore } from "./stores/editorStore";
import type { TabData } from "./types/editor";
import type { TabContainer } from "./stores/editorStore";
import { useProjectStore } from "./stores/projectStore";
import { LoadingOverlayContainer } from "./components/LoadingOverlay/LoadingContainer";
import { useLoadingEvents } from "./hooks/useLoadingEvents";
import { useRecentProjectsStore } from "./stores/recentProjectsStore";
import { ErrorModal } from "./components/ErrorModal";
import { useErrorModal } from "./hooks/useErrorModal";
import { Footer } from "./components/Footer/Footer";
import { ActionsPanel } from "./components/ActionsPanel/ActionsPanel";

interface EditorState {
  containers: TabData[];
  active_tab_index: number;
}

function App() {
  const [showSidebar, setShowSidebar] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const { containers, setContainers, addTab } = useEditorStore();
  const { setProjectPath: setProjectStorePath, setFiles, setLoadingFiles } = useProjectStore();
  const { loadRecentProjects } = useRecentProjectsStore();
  const { isOpen: isErrorOpen, title: errorTitle, error: errorMessage, hideError } = useErrorModal();

  useLoadingEvents();

  useEffect(() => {
    loadRecentProjects().catch(console.error);
  }, []);

  const handleSidebarResize = useCallback((delta: number) => {
    setSidebarWidth((width) => {
      const newWidth = width + delta;
      return Math.max(150, Math.min(newWidth, window.innerWidth * 0.8));
    });
  }, []);

  useEffect(() => {
    invoke<EditorState>("load_editor_state")
      .then((state: EditorState) => {
        if (state.containers) {
          const formattedContainers: TabContainer[] = [
            {
              id: "main",
              tabs: state.containers || [],
              activeTabIndex: state.active_tab_index || 0,
            },
          ];
          setContainers(formattedContainers);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    invoke("save_editor_state", {
      state: { containers },
    }).catch(console.error);
  }, [containers]);

  const handleFileSelect = (path: string, content: string) => {
    const newTab: TabData = {
      id: `tab-${Date.now()}`,
      title: path.split("/").pop() || path,
      type: path === "preview" ? "preview" : path === "blueprint" ? "blueprint" : "code",
      path,
      content,
    };

    addTab(newTab);
  };

  const handleOpenSettings = () => {
    console.log("Open settings");
  };

  return (
    <>
      <LoadingOverlayContainer />
      <div className="flex flex-col h-screen bg-editor-bg">
        <Header
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          onOpenSettings={handleOpenSettings}
        />

        <div className="flex flex-1 overflow-hidden">
          {showSidebar && (
            <>
              <div
                style={{ width: sidebarWidth }}
                className="flex-shrink-0"
              >
                <Sidebar onFileSelect={handleFileSelect} />
              </div>
              <Resizer onResize={handleSidebarResize} />
            </>
          )}

          <div className="flex-1 overflow-hidden bg-editor-bg">{containers[0]?.tabs.length === 0 ? <WelcomeScreen /> : <TabBar />}</div>
          <ActionsPanel />
        </div>
        <Footer />
      </div>
      <ErrorModal
        isOpen={isErrorOpen}
        onClose={hideError}
        title={errorTitle}
        error={errorMessage}
      />
    </>
  );
}

export default App;
