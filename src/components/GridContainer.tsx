import React from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { TabContainer } from "../types/editor";
import { WindowManager } from "../services/windowManager";
import { invoke } from "@tauri-apps/api/core";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { getFileIcon } from "../utils/fileIcons";

const ResponsiveGridLayout = WidthProvider(Responsive);

interface GridContainerProps {
  containers: TabContainer[];
  layouts: any;
  onLayoutChange: (layout: any, layouts: any) => void;
  onContainerUpdate: (containers: TabContainer[]) => void;
}

export const GridContainer: React.FC<GridContainerProps> = ({ containers, layouts, onLayoutChange, onContainerUpdate }) => {
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const sourceContainer = containers.find((c) => c.id === source.droppableId);
    const destContainer = containers.find((c) => c.id === destination.droppableId);

    if (!sourceContainer || !destContainer) return;

    const newContainers = [...containers];
    const [movedTab] = sourceContainer.tabs.splice(source.index, 1);
    destContainer.tabs.splice(destination.index, 0, movedTab);

    onContainerUpdate(newContainers);
  };

  const handleTabDetach = async (containerId: string, tabIndex: number) => {
    const container = containers.find((c) => c.id === containerId);
    if (!container) return;

    const tab = container.tabs[tabIndex];
    await WindowManager.detachTab(tab);

    // Remove tab from current container
    const newContainers = containers.map((c) =>
      c.id === containerId
        ? {
            ...c,
            tabs: c.tabs.filter((_, i) => i !== tabIndex),
            activeTab: Math.max(0, c.activeTab - 1),
          }
        : c
    );

    onContainerUpdate(newContainers);
  };

  const handleSplitContainer = (containerId: string, direction: "vertical" | "horizontal") => {
    const newContainerId = `container${containers.length + 1}`;
    const container = containers.find((c) => c.id === containerId);
    if (!container) return;

    // Split tabs between containers
    const midPoint = Math.floor(container.tabs.length / 2);
    const newTabs = container.tabs.splice(midPoint);

    const newContainers = [...containers, { id: newContainerId, tabs: newTabs, activeTab: 0 }];

    // Update layout
    const currentLayout = layouts.lg.find((l: any) => l.i === containerId);
    if (currentLayout) {
      const { x, y, w, h } = currentLayout;
      const newLayout =
        direction === "vertical"
          ? [
              { ...currentLayout, h: h / 2 },
              { i: newContainerId, x, y: y + h / 2, w, h: h / 2 },
            ]
          : [
              { ...currentLayout, w: w / 2 },
              { i: newContainerId, x: x + w / 2, y, w: w / 2, h },
            ];

      onLayoutChange([...layouts.lg.filter((l: any) => l.i !== containerId), ...newLayout], { ...layouts, lg: newLayout });
    }

    onContainerUpdate(newContainers);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
        rowHeight={30}
        onLayoutChange={(layout, layouts) => {
          onLayoutChange(layout, layouts);
          invoke("save_layout", { layout: JSON.stringify(layouts) });
        }}
        isDraggable
        isResizable
        draggableHandle=".tab-handle"
      >
        {containers.map((container) => (
          <div
            key={container.id}
            className="grid-container"
          >
            <div className="grid-container-header">
              <button
                onClick={() => handleSplitContainer(container.id, "vertical")}
                className="split-button"
              >
                Split Vertical
              </button>
              <button
                onClick={() => handleSplitContainer(container.id, "horizontal")}
                className="split-button"
              >
                Split Horizontal
              </button>
            </div>
            <Droppable droppableId={container.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <TabList>
                    {container.tabs.map((tab, index) => (
                      <Tab key={tab.id}>
                        <div className="flex items-center gap-2">
                          {getFileIcon(tab.path || "")}
                          <span>{tab.title}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTabDetach(container.id, index);
                            }}
                            className="hover:text-red-500"
                          >
                            ×
                          </button>
                        </div>
                      </Tab>
                    ))}
                  </TabList>
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </ResponsiveGridLayout>
    </DragDropContext>
  );
};
