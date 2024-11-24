import React from "react";
import { Handle, Position } from "reactflow";

export const SceneNode = ({ data }: any) => (
  <div className="bg-editor-bg border border-gray-700 rounded-lg p-4">
    <Handle
      type="target"
      position={Position.Left}
    />
    <div className="font-bold text-sm mb-2">{data.label}</div>
    <div className="text-xs text-gray-400">{data.dialog}</div>
    <Handle
      type="source"
      position={Position.Right}
    />
  </div>
);

export const ChoiceNode = ({ data }: any) => (
  <div className="bg-blue-900/50 border border-blue-500 rounded-lg p-4">
    <Handle
      type="target"
      position={Position.Left}
    />
    <div className="font-bold text-sm mb-2">{data.label}</div>
    <div className="text-xs text-blue-300">{data.choices?.length} choices available</div>
    <Handle
      type="source"
      position={Position.Right}
    />
  </div>
);
