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
  const edgeType = data?.type || "straight";
  const edgeSegmentsCount = positionHandlers.length + 1;

  const getPathFunction = () => {
    switch (edgeType) {
      case "straight":
        return getStraightPath;
      case "smoothstep":
        return getSmoothStepPath;
      default:
        return getBezierPath;
    }
  };

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

      const [edgePath, labelX, labelY] = getPathFunction()({
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
    newPosition: PositionHandler
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

  const addHandlerIfNotNearby = (index: number, position: PositionHandler) => {
    const threshold = 10;

    reactFlowInstance.setEdges((edges) =>
      edges.map((edge) => {
        if (edge.id === id && Array.isArray(edge.data?.positionHandlers)) {
          const handlers = edge.data.positionHandlers;
          const isPointNearby = handlers.some(
            (handler) =>
              Math.sqrt(
                Math.pow(handler.x - position.x, 2) +
                  Math.pow(handler.y - position.y, 2)
              ) <= threshold
          );

          if (!isPointNearby) {
            handlers.splice(index, 0, position);
          }
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
          onClick={(event) => {
            const position = reactFlowInstance.screenToFlowPosition({
              x: event.clientX,
              y: event.clientY,
            });
            addHandlerIfNotNearby(index, position);
          }}
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
