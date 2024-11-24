import React, { useState, useRef } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { getFileIcon } from "../utils/fileIcons";
import CodeEditor from "./CodeEditor";
import NodeEditor from "./NodeEditor";
import ScenePreview from "./ScenePreview";
import type { TabData, GridContainer, Layouts, Layout, TabProps } from "../types/editor";

const ResponsiveGridLayout = WidthProvider(Responsive);

interface GridLayoutProps {
  tabs: TabData[];
  activeTabIndex: number;
  onTabChange: (index: number) => void;
  onTabClose: (index: number) => void;
  onLayoutChange: (layouts: Layouts) => void;
}

export const GridLayout: React.FC<GridLayoutProps> = ({ tabs, activeTabIndex, onTabChange, onTabClose, onLayoutChange }) => {
  const [containers, setContainers] = useState<GridContainer[]>([{ id: "main", tabs: tabs, activeTab: activeTabIndex }]);

  const [layout, setLayout] = useState<Layouts>({
    lg: [{ i: "main", x: 0, y: 0, w: 12, h: 12 }],
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dropZone, setDropZone] = useState<"left" | "right" | "top" | "bottom" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [dropIndicator, setDropIndicator] = useState<{
    show: boolean;
    position: "left" | "right" | "top" | "bottom" | null;
    containerId: string;
  }>({
    show: false,
    position: null,
    containerId: "",
  });

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (result: any) => {
    setIsDragging(false);
    setDropZone(null);

    if (!result.destination) return;

    const { source, destination } = result;
    const sourceContainer = containers.find((c) => c.id === source.droppableId);

    if (!sourceContainer) return;

    // Determina a ação baseada na drop zone
    if (dropZone) {
      const [movedTab] = sourceContainer.tabs.splice(source.index, 1);
      const newContainerId = `container-${Date.now()}`;
      const currentLayout = layout.lg.find((l) => l.i === source.droppableId);

      if (currentLayout) {
        const { x, y, w, h } = currentLayout;
        let newLayout;

        switch (dropZone) {
          case "right":
            newLayout = {
              ...currentLayout,
              w: w / 2,
              i: source.droppableId,
              x,
              y,
            };
            break;
          case "left":
            newLayout = {
              ...currentLayout,
              w: w / 2,
              i: source.droppableId,
              x: x + w / 2,
              y,
            };
            break;
          case "bottom":
            newLayout = {
              ...currentLayout,
              h: h / 2,
              i: source.droppableId,
              x,
              y: y + h / 2,
            };
            break;
          case "top":
            newLayout = {
              ...currentLayout,
              h: h / 2,
              i: source.droppableId,
              x,
              y,
            };
            break;
        }

        setContainers((prev) => [
          ...prev,
          {
            id: newContainerId,
            tabs: [movedTab],
            activeTab: 0,
          },
        ]);

        setLayout((prev) => ({
          ...prev,
          lg: [...prev.lg, newLayout],
        }));
      }
    } else {
      // Comportamento normal de drag and drop entre containers
      // ... código anterior de drag and drop
    }
  };

  const handleDragOver = React.useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const container = e.currentTarget.getBoundingClientRect();
    const containerId = e.currentTarget.getAttribute("data-container-id") || "";

    const x = e.clientX - container.left;
    const y = e.clientY - container.top;

    // Define drop zones (20% of edges)
    const threshold = 0.2;
    const leftZone = container.width * threshold;
    const rightZone = container.width * (1 - threshold);
    const topZone = container.height * threshold;
    const bottomZone = container.height * (1 - threshold);

    let position: "left" | "right" | "top" | "bottom" | null = null;

    if (x < leftZone) position = "left";
    else if (x > rightZone) position = "right";
    else if (y < topZone) position = "top";
    else if (y > bottomZone) position = "bottom";

    setDropIndicator({
      show: true,
      position,
      containerId,
    });
  }, []);

  const handleDrop = (e: React.DragEvent, targetContainerId: string) => {
    const { position } = dropIndicator;
    if (!position) return;

    const sourceContainerId = e.dataTransfer.getData("sourceContainerId");
    const tabIndex = parseInt(e.dataTransfer.getData("tabIndex"));

    // Create new container based on drop position
    const sourceContainer = containers.find((c) => c.id === sourceContainerId);
    if (!sourceContainer) return;

    const [movedTab] = sourceContainer.tabs.splice(tabIndex, 1);
    const newContainerId = `container-${Date.now()}`;

    // Update layout based on drop position
    const currentLayout = layout.lg.find((l) => l.i === targetContainerId);
    if (currentLayout) {
      const { x, y, w, h } = currentLayout;
      let newLayout;

      switch (position) {
        case "right":
          newLayout = {
            ...currentLayout,
            w: w / 2,
            x: x + w / 2,
          };
          break;
        case "left":
          newLayout = {
            ...currentLayout,
            w: w / 2,
            x,
          };
          break;
        case "bottom":
          newLayout = {
            ...currentLayout,
            h: h / 2,
            y: y + h / 2,
          };
          break;
        case "top":
          newLayout = {
            ...currentLayout,
            h: h / 2,
            y,
          };
          break;
      }

      setLayout((prev) => ({
        ...prev,
        lg: [...prev.lg, newLayout],
      }));

      setContainers((prev) => [
        ...prev,
        {
          id: newContainerId,
          tabs: [movedTab],
          activeTab: 0,
        },
      ]);
    }

    setDropIndicator({ show: false, position: null, containerId: "" });
  };

  const splitContainer = (containerId: string, direction: "vertical" | "horizontal") => {
    const container = containers.find((c) => c.id === containerId);
    if (!container) return;

    const newContainerId = `container-${containers.length}`;
    const containerTabs = [...container.tabs];
    const midPoint = Math.floor(containerTabs.length / 2);
    const newTabs = containerTabs.splice(midPoint);

    setContainers((prev) => [...prev, { id: newContainerId, tabs: newTabs, activeTab: 0 }]);

    // Atualizar layout
    const currentLayout = layout.lg.find((l) => l.i === containerId);
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

      setLayout((prev) => ({
        ...prev,
        lg: [...prev.lg.filter((l) => l.i !== containerId), ...newLayout],
      }));
    }
  };

  const handleLayoutChange = (currentLayout: Layout[], allLayouts: Layouts) => {
    setLayout(allLayouts);
    onLayoutChange(allLayouts);
  };

  return (
    <DragDropContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        ref={containerRef}
        className="h-full relative"
        onDragOver={handleDragOver}
      >
        {/* Drop zone indicators */}
        {isDragging && (
          <>
            <div className={`absolute inset-y-0 left-0 w-1/5 bg-blue-500/20 pointer-events-none transition-opacity ${dropZone === "left" ? "opacity-100" : "opacity-0"}`} />
            <div className={`absolute inset-y-0 right-0 w-1/5 bg-blue-500/20 pointer-events-none transition-opacity ${dropZone === "right" ? "opacity-100" : "opacity-0"}`} />
            <div className={`absolute inset-x-0 top-0 h-1/5 bg-blue-500/20 pointer-events-none transition-opacity ${dropZone === "top" ? "opacity-100" : "opacity-0"}`} />
            <div className={`absolute inset-x-0 bottom-0 h-1/5 bg-blue-500/20 pointer-events-none transition-opacity ${dropZone === "bottom" ? "opacity-100" : "opacity-0"}`} />
          </>
        )}

        <ResponsiveGridLayout
          className="layout flex-1"
          layouts={layout}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
          rowHeight={30}
          onLayoutChange={(currentLayout: Layout[], allLayouts: Layouts) => {
            setLayout(allLayouts as Layouts);
            onLayoutChange(allLayouts as Layouts);
          }}
          isDraggable
          isResizable
          margin={[4, 4]}
        >
          {containers.map((container) => (
            <div
              key={container.id}
              className="relative"
              data-container-id={container.id}
              onDragOver={handleDragOver}
              onDrop={(e) => {
                e.preventDefault();
                const containerId = e.currentTarget.getAttribute("data-container-id");
                if (containerId) {
                  handleDrop(e, containerId);
                }
              }}
            >
              {dropIndicator.show && dropIndicator.containerId === container.id && (
                <div
                  className={`absolute inset-0 pointer-events-none ${
                    dropIndicator.position === "left"
                      ? "bg-blue-500/20 left-0 w-1/2"
                      : dropIndicator.position === "right"
                      ? "bg-blue-500/20 right-0 w-1/2"
                      : dropIndicator.position === "top"
                      ? "bg-blue-500/20 top-0 h-1/2"
                      : dropIndicator.position === "bottom"
                      ? "bg-blue-500/20 bottom-0 h-1/2"
                      : ""
                  }`}
                />
              )}
              <div className="h-full bg-editor-bg border border-gray-700">
                <Tabs
                  selectedIndex={container.activeTab}
                  onSelect={(index: number) => {
                    setContainers((prev) => prev.map((c) => (c.id === container.id ? { ...c, activeTab: index } : c)));
                  }}
                  className="h-full flex flex-col"
                >
                  <Droppable
                    droppableId={container.id}
                    direction="horizontal"
                  >
                    {(provided) => (
                      <TabList
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="flex bg-tab-bg border-b border-gray-700"
                      >
                        {container.tabs.map((tab, index) => (
                          <Draggable
                            key={tab.id}
                            draggableId={tab.id}
                            index={index}
                          >
                            {(provided) => (
                              <Tab
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="px-3 py-2 flex items-center gap-2 border-r border-gray-700 hover:bg-gray-700 cursor-pointer"
                                tabIndex={`${index}`}
                              >
                                {getFileIcon(tab.path)}
                                <span>{tab.title}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onTabClose(index);
                                  }}
                                  className="ml-2 hover:text-red-500"
                                >
                                  ×
                                </button>
                              </Tab>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </TabList>
                    )}
                  </Droppable>

                  {container.tabs.map((tab) => (
                    <TabPanel
                      key={tab.id}
                      className="flex-1 overflow-hidden"
                    >
                      <div className="w-full h-full">{renderTabContent(tab)}</div>
                    </TabPanel>
                  ))}
                </Tabs>
              </div>
            </div>
          ))}
        </ResponsiveGridLayout>

        {/* Área para criar novos containers */}
        <Droppable
          droppableId="new-container"
          direction="horizontal"
        >
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="h-1 bg-blue-500/20 hover:bg-blue-500/40 transition-colors"
            >
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  );
};

const renderTabContent = (tab: TabData) => {
  const contentStyle = "w-full h-full";

  switch (tab.type) {
    case "code":
      return (
        <CodeEditor
          file={tab.path}
          content={tab.content}
          className={contentStyle}
        />
      );
    case "preview":
      return (
        <ScenePreview
          file={tab.path}
          className={contentStyle}
        />
      );
    case "blueprint":
      return (
        <NodeEditor
          file={tab.path}
          content={tab.content}
          className={contentStyle}
        />
      );
    case "image":
      return (
        <div className={`${contentStyle} flex items-center justify-center bg-gray-900`}>
          <img
            src={tab.path}
            alt={tab.title}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      );
    default:
      return null;
  }
};

export default GridLayout;
