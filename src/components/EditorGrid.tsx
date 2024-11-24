import React, { useCallback, useEffect, useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { TabContainer } from "../types/editor";
import { windowManager } from "../config/tauriConfig";
import EditorContainer from "./EditorContainer";

const ResponsiveGridLayout = WidthProvider(Responsive);

interface EditorGridProps {
  containers: TabContainer[];
  onContainerUpdate: (containers: TabContainer[]) => void;
}

export const EditorGrid: React.FC<EditorGridProps> = ({ containers, onContainerUpdate }) => {
  const [layouts, setLayouts] = useState({
    lg: containers.map((container, index) => ({
      i: container.id,
      x: (index % 2) * 6,
      y: Math.floor(index / 2) * 6,
      w: 6,
      h: 12,
    })),
  });

  useEffect(() => {
    // Load saved layout
    windowManager.loadLayout().then((savedLayout) => {
      if (savedLayout) {
        try {
          setLayouts(JSON.parse(savedLayout));
        } catch (e) {
          console.error("Failed to parse saved layout:", e);
        }
      }
    });
  }, []);

  const handleLayoutChange = useCallback((layout: any, layouts: any) => {
    setLayouts(layouts);
    windowManager.saveLayout(JSON.stringify(layouts));
  }, []);

  return (
    <DragDropContext
      onDragEnd={(result) => {
        if (!result.destination) return;
        const { source, destination } = result;

        const sourceContainer = containers.find((c) => c.id === source.droppableId);
        const destContainer = containers.find((c) => c.id === destination.droppableId);

        if (!sourceContainer || !destContainer) return;

        const newContainers = [...containers];
        const [movedTab] = sourceContainer.tabs.splice(source.index, 1);
        destContainer.tabs.splice(destination.index, 0, movedTab);

        onContainerUpdate(newContainers);
      }}
    >
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
        rowHeight={30}
        onLayoutChange={handleLayoutChange}
        isDraggable
        isResizable
        margin={[4, 4]}
      >
        {containers.map((container) => (
          <div
            key={container.id}
            className="bg-editor-bg border border-gray-700 overflow-hidden"
          >
            <EditorContainer
              container={container}
              onUpdate={(updatedContainer) => {
                onContainerUpdate(containers.map((c) => (c.id === updatedContainer.id ? updatedContainer : c)));
              }}
            />
          </div>
        ))}
      </ResponsiveGridLayout>
    </DragDropContext>
  );
};
