import { useCallback } from "react";
import {
  useNodesState,
  useEdgesState,
  ReactFlow,
  Controls,
  Background,
  Node,
  Edge,
  ConnectionMode,
  addEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import PositionableEdge from "./PositionableEdge";

const App = () => {
  const initialNodes: Node[] = [
    // Smooth step
    {
      id: "SmoothStepA",
      type: "input",
      data: { label: "SmoothStep" },
      position: { x: 125, y: 0 },
    },
    {
      id: "SmoothStepB",
      type: "output",
      data: { label: "SmoothStepB" },
      position: { x: 125, y: 200 },
    },
  ];

  const initialEdges: Edge[] = [
    {
      id: "SmoothStepEdge",
      source: "SmoothStepA",
      target: "SmoothStepB",
      type: "positionableedge",
      data: {
        type: "smoothstep",
        positionHandlers: [
          {
            x: 150.0,
            y: 100.0,
          },
          {
            x: 250.0,
            y: 150.0,
          },
        ],
      },
    },
  ];
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const edgeTypes = {
    positionableedge: PositionableEdge,
  };

  const nodeTypes = {};

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      snapToGrid={false}
      edgeTypes={edgeTypes}
      nodeTypes={nodeTypes}
      fitView
      attributionPosition="top-right"
      connectionMode={ConnectionMode.Loose}
    >
      <Controls />
      <Background />
    </ReactFlow>
  );
};

export default App;

