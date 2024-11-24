import { Edge, Node, Position } from "reactflow";

export const nodeTypes = {
  default: {
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    style: {
      background: "#1e1e1e",
      color: "#fff",
      border: "1px solid #374151",
      borderRadius: "8px",
      padding: "10px",
    },
  },
  choiceNode: {
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    style: {
      background: "#2d4b6d",
      color: "#fff",
      border: "1px solid #374151",
      borderRadius: "8px",
      padding: "10px",
    },
  },
};

export const edgeTypes = {
  default: {
    style: {
      stroke: "#4b5563",
    },
    labelStyle: {
      fill: "#9ca3af",
      fontSize: 12,
    },
    markerEnd: {
      type: "arrowclosed",
    },
  },
};
