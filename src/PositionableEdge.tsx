import {
  EdgeLabelRenderer,
  EdgeProps,
  useReactFlow,
  getBezierPath,
  getStraightPath,
  getSmoothStepPath,
} from "@xyflow/react";
import "./PositionableEdge.css";
import ClickableBaseEdge from "./ClickableBaseEdge";

type PositionHandler = {
  x: number;
  y: number;
};

interface CustomEdgeData extends Record<string, unknown> {
  positionHandlers?: PositionHandler[];
  type?: string;
}

interface CustomEdgeProps extends EdgeProps {
  data?: CustomEdgeData;
}


export default function PositionableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: CustomEdgeProps) {
  const reactFlowInstance = useReactFlow();
  const positionHandlers: PositionHandler[] = data?.positionHandlers || [];
  const type = data?.type || "default";
  const edgeSegmentsCount = positionHandlers.length + 1;

  const pathFunction =
    type === "straight"
      ? getStraightPath
      : type === "smoothstep"
      ? getSmoothStepPath
      : getBezierPath;

  // Generate edge segments with custom handlers
  const edgeSegmentsArray = Array.from({ length: edgeSegmentsCount }).map(
    (_, i) => {
      const segmentSourceX =
        i === 0 ? sourceX : positionHandlers[i - 1]?.x ?? sourceX;
      const segmentSourceY =
        i === 0 ? sourceY : positionHandlers[i - 1]?.y ?? sourceY;
      const segmentTargetX =
        i === edgeSegmentsCount - 1
          ? targetX
          : positionHandlers[i]?.x ?? targetX;
      const segmentTargetY =
        i === edgeSegmentsCount - 1
          ? targetY
          : positionHandlers[i]?.y ?? targetY;

      const [edgePath, labelX, labelY] = pathFunction({
        sourceX: segmentSourceX,
        sourceY: segmentSourceY,
        sourcePosition,
        targetX: segmentTargetX,
        targetY: segmentTargetY,
        targetPosition,
      });

      return { edgePath, labelX, labelY };
    }
  );

  const updateHandlerPosition = (
    handlerIndex: number,
    newPosition: { x: number; y: number }
  ) => {
    reactFlowInstance.setEdges((edges) =>
      edges.map((edge) => {
        if (edge.id === id && Array.isArray(edge.data?.positionHandlers)) {
          edge.data.positionHandlers[handlerIndex] = newPosition;
        }
        return edge;
      })
    );
  };

  const removeHandler = (handlerIndex: number) => {
    reactFlowInstance.setEdges((edges) =>
      edges.map((edge) => {
        if (edge.id === id && Array.isArray(edge.data?.positionHandlers)) {
          edge.data.positionHandlers.splice(handlerIndex, 1);
        }
        return edge;
      })
    );
  };

  return (
    <>
      {edgeSegmentsArray.map(({ edgePath }, index) => (
        <ClickableBaseEdge
          key={`${id}_segment${index}`}
          id={`${id}_segment${index}`}
          path={edgePath}
          style={style}
          markerEnd={markerEnd}
        />
      ))}
      {positionHandlers.map(({ x, y }, handlerIndex) => (
        <EdgeLabelRenderer key={`${id}_handler${handlerIndex}`}>
          <div
            className="positionHandlerContainer"
            style={{
              transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
            }}
          >
            <div
              className="positionHandler"
              draggable
              onDragStart={(event) => {
                event.preventDefault();
              }}
              onMouseDown={(event) => {
                const onMouseMove = (moveEvent: MouseEvent) => {
                  const newPosition = reactFlowInstance.screenToFlowPosition({
                    x: moveEvent.clientX,
                    y: moveEvent.clientY,
                  });
                  updateHandlerPosition(handlerIndex, newPosition);
                };

                const onMouseUp = () => {
                  document.removeEventListener("mousemove", onMouseMove);
                  document.removeEventListener("mouseup", onMouseUp);
                };

                document.addEventListener("mousemove", onMouseMove);
                document.addEventListener("mouseup", onMouseUp);
              }}
              onContextMenu={(event) => {
                event.preventDefault();
                removeHandler(handlerIndex);
              }}
            />
          </div>
        </EdgeLabelRenderer>
      ))}
    </>
  );
}
