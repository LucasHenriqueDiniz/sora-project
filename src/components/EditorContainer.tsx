import React from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { TabContainer } from "../types/editor";
import CodeEditor from "./CodeEditor";
import NodeEditor from "./NodeEditor";
import ScenePreview from "./ScenePreview";
import { getFileIcon } from "../utils/fileIcons";
import DraggableTab from "./DraggableTab";

interface EditorContainerProps {
  container: TabContainer;
  onUpdate: (container: TabContainer) => void;
}

const EditorContainer: React.FC<EditorContainerProps> = ({ container, onUpdate }) => {
  return (
    <Droppable droppableId={container.id}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          <Tabs
            selectedIndex={container.activeTab}
            onSelect={(index) => {
              onUpdate({
                ...container,
                activeTab: index,
              });
            }}
          >
            <TabList className="flex bg-tab-bg flex-nowrap overflow-x-auto">
              {container.tabs.map((tab, index) => (
                <Draggable
                  key={tab.id}
                  draggableId={tab.id}
                  index={index}
                >
                  {(provided) => (
                    <DraggableTab
                      ref={provided.innerRef}
                      draggableProps={provided.draggableProps}
                      dragHandleProps={provided.dragHandleProps}
                      className="tab-item flex-shrink-0"
                      tabIndex="0"
                    >
                      <div className="flex items-center gap-2">
                        {getFileIcon(tab.path || "")}
                        <span>{tab.title}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdate({
                              ...container,
                              tabs: container.tabs.filter((_, i) => i !== index),
                              activeTab: Math.max(0, container.activeTab - 1),
                            });
                          }}
                          className="hover:text-red-500"
                        >
                          ×
                        </button>
                      </div>
                    </DraggableTab>
                  )}
                </Draggable>
              ))}
            </TabList>

            {container.tabs.map((tab) => (
              <TabPanel
                key={tab.id}
                className="h-full"
              >
                {tab.type === "code" && (
                  <CodeEditor
                    file={tab.path || ""}
                    content={tab.content}
                  />
                )}
                {tab.type === "preview" && <ScenePreview file={tab.path || ""} />}
                {tab.type === "blueprint" && (
                  <NodeEditor
                    file={tab.path || ""}
                    content={tab.content}
                  />
                )}
              </TabPanel>
            ))}
          </Tabs>
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default EditorContainer;
