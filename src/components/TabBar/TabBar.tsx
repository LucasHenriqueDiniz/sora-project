import React from "react";
import { TabList, Tabs, TabPanel } from "react-tabs";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import Tab from "./Tab";
import Resizer from "../Resizer";
import CodeEditor from "../CodeEditor";
import NodeEditor from "../NodeEditor";
import ScenePreview from "../ScenePreview";
import { useEditorStore } from "../../stores/editorStore";
import type { TabData } from "../../types/editor";

const TabBar: React.FC = () => {
  const { containers, activeContainer, reorderTabs, setActiveTab, removeTab } = useEditorStore();
  const [containerSizes, setContainerSizes] = React.useState<Record<string, number>>({});

  const handleContainerResize = React.useCallback((containerId: string, delta: number) => {
    setContainerSizes((prev) => ({
      ...prev,
      [containerId]: Math.max(150, (prev[containerId] || 0) + delta),
    }));
  }, []);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceContainerId = result.source.droppableId;
    const targetContainerId = result.destination.droppableId;

    reorderTabs(sourceContainerId, result.source.index, targetContainerId, result.destination.index);
  };

  const renderContent = (tab: TabData) => {
    switch (tab.type) {
      case "code":
        return (
          <CodeEditor
            file={tab.path}
            content={tab.content}
          />
        );
      case "preview":
        return <ScenePreview file={tab.path} />;
      case "blueprint":
        return (
          <NodeEditor
            file={tab.path}
            content={tab.content}
          />
        );
      default:
        return null;
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="h-full flex">
        {containers.map((container, index) => (
          <React.Fragment key={container.id}>
            <div
              className="flex-1 flex flex-col h-full min-w-[150px]"
              style={{
                width: containerSizes[container.id] || "auto",
                flexGrow: containerSizes[container.id] ? 0 : 1,
              }}
            >
              <Tabs
                selectedIndex={container.activeTabIndex}
                onSelect={(index) => setActiveTab(container.id, index)}
                className="flex flex-col h-full"
              >
                <div className="flex-shrink-0 relative">
                  <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                    <Droppable
                      droppableId={container.id}
                      direction="horizontal"
                    >
                      {(provided) => (
                        <TabList
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="flex bg-tab-bg border-b border-gray-700 min-w-min w-max"
                        >
                          {container.tabs.map((tab, index) => (
                            <Tab
                              key={tab.id}
                              id={tab.id}
                              title={tab.title}
                              path={tab.path}
                              index={index}
                              isActive={index === container.activeTabIndex && container.id === activeContainer}
                              onClose={(e) => {
                                e.preventDefault();
                                removeTab(container.id, index);
                              }}
                              onClick={() => setActiveTab(container.id, index)}
                            />
                          ))}
                          {provided.placeholder}
                        </TabList>
                      )}
                    </Droppable>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden">
                  {container.tabs.map((tab, index) => (
                    <TabPanel
                      key={tab.id}
                      className="h-full"
                      selectedClassName="block"
                      selected={index === container.activeTabIndex}
                    >
                      {renderContent(tab)}
                    </TabPanel>
                  ))}
                </div>
              </Tabs>
            </div>
            {index < containers.length - 1 && (
              <Resizer
                onResize={(delta) => handleContainerResize(container.id, delta)}
                direction="horizontal"
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </DragDropContext>
  );
};

export default TabBar;
