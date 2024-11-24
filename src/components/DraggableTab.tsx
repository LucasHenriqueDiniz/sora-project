import React, { forwardRef } from "react";
import { Tab } from "react-tabs";

interface DraggableTabProps {
  children: React.ReactNode;
  className?: string;
  draggableProps: any;
  dragHandleProps: any;
  tabIndex?: string;
}

const DraggableTab = forwardRef<HTMLLIElement, DraggableTabProps>(({ children, className, draggableProps, dragHandleProps, tabIndex, ...props }, ref) => {
  return (
    <li
      role="tab"
      {...props}
      className={className}
      ref={ref}
      {...draggableProps}
      {...dragHandleProps}
      data-rbd-draggable-context-id={dragHandleProps?.["data-rbd-drag-handle-context-id"]}
      data-rbd-draggable-id={draggableProps?.["data-rbd-draggable-id"]}
      tabIndex={tabIndex || "0"}
    >
      {children}
    </li>
  );
});

DraggableTab.displayName = "DraggableTab";

export default DraggableTab;
