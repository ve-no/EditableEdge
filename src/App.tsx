import { useCallback, useState } from "react";
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
  ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import PositionableEdge from "./PositionableEdge";

const App = () => {
  const initialNodes: Node[] = [
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
        type: "straight",
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
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(
    null
  );
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  const edgeTypes = {
    positionableedge: PositionableEdge,
  };

  const nodeTypes = {};

  const handlePaneClick = useCallback(
    (event: React.MouseEvent<Element, MouseEvent>) => {
      // const pane = event.currentTarget as HTMLElement;
      // const bounds = pane.getBoundingClientRect();
      if (!rfInstance) {
        console.warn("ReactFlow instance is not initialized.");
        return;
      }
      const bounds = (event.target as HTMLElement).getBoundingClientRect();
      const viewport = rfInstance.getViewport();
      const zoom = viewport.zoom;
      const offsetX = viewport.x;
      const offsetY = viewport.y;

      const x = (event.clientX - bounds.left - offsetX) / zoom;
      const y = (event.clientY - bounds.top - offsetY) / zoom;

      if (!startPoint) {
        const startNode = {
          id: `node-${nodes.length + 1}`,
          position: { x, y },
          data: { label: `Node ${nodes.length + 1}` },
          draggable: true,
          type: "input",
        };

        setNodes((prevNodes) => [...prevNodes, startNode]);
        setStartPoint({ x, y });
      } else {
        const endNode = {
          id: `node-${nodes.length + 1}`,
          position: { x, y },
          data: { label: `Node ${nodes.length + 1}` },
          draggable: true,
          type: "output",
        };

        setNodes((prevNodes) => [...prevNodes, endNode]);
        const midpointX = (startPoint.x + x) / 2;
        const midpointY = (startPoint.y + y) / 2;
        const newEdge: Edge = {
          id: `edge-${edges.length + 1}`,
          source: `node-${nodes.length}`,
          target: `node-${nodes.length + 1}`,
          type: "positionableedge",
          data: {
            type: "straight",
            positionHandlers: [
              { x: midpointX, y: midpointY }, // Add midpoint as the position handler
            ],
          },
        };

        setEdges((prevEdges) => [...prevEdges, newEdge]);
        setStartPoint(null);
      }
    },
    [nodes, edges, setNodes, setEdges, startPoint]
  );

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
      onPaneClick={handlePaneClick} // Adding pane click functionality
      snapToGrid={false}
      edgeTypes={edgeTypes}
      nodeTypes={nodeTypes}
      fitView
      attributionPosition="top-right"
      connectionMode={ConnectionMode.Loose}
      onInit={(instance) => setRfInstance(instance)}
    >
      <Controls />
      <Background />
    </ReactFlow>
  );
};

export default App;
