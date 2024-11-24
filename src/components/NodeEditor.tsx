import React from "react";
import ReactFlow, { Background, Controls, Node, Edge, Connection, useNodesState, useEdgesState, addEdge, MarkerType } from "reactflow";
import "reactflow/dist/style.css";
import { samplePhase } from "../types/visualNovel";
import type { NodeEditorProps } from "../types/editor";

const NodeEditor: React.FC<NodeEditorProps> = ({ className = "" }) => {
  const initialNodes: Node[] = Object.entries(samplePhase.scenes).map(([id, scene], index) => ({
    id,
    type: scene.choices ? "choiceNode" : "default",
    position: { x: 250 * (index % 3), y: 150 * Math.floor(index / 3) },
    data: { label: scene.dialog[0].text },
  }));

  const initialEdges: Edge[] = Object.entries(samplePhase.scenes).flatMap(([id, scene]) => {
    if (scene.choices) {
      return scene.choices.map((choice, index) => ({
        id: `${id}-${choice.nextSceneId}-${index}`,
        source: id,
        target: choice.nextSceneId,
        label: choice.text,
        type: "smoothstep",
        markerEnd: { type: MarkerType.ArrowClosed },
      }));
    }
    return [];
  });

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = React.useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div className={`w-full h-full ${className}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        className="bg-editor-bg"
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default NodeEditor;
