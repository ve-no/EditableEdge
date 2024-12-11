import React, { useCallback } from "react";
import {
  EdgeLabelRenderer,
  EdgeProps,
  useReactFlow,
  getBezierPath,
  getStraightPath,
  getSmoothStepPath,
  Edge,
} from "@xyflow/react";
import "./PositionableEdge.css"
interface ClickableBaseEdgeProps {
  id: string;
  path: string;
  style?: React.CSSProperties;
  markerEnd?: string;
  markerStart?: string;
  interactionWidth?: number;
  onClick?: (event: React.MouseEvent<SVGPathElement, MouseEvent>) => void;
}

const ClickableBaseEdge: React.FC<ClickableBaseEdgeProps> = ({
  id,
  path,
  style,
  markerEnd,
  markerStart,
  interactionWidth = 20,
  onClick,
}) => {
  return (
    <>
      <path
        id={id}
        style={style}
        d={path}
        fill="none"
        className="react-flow__edge-path"
        markerEnd={markerEnd}
        markerStart={markerStart}
      />
      {interactionWidth && (
        <path
          d={path}
          fill="none"
          strokeOpacity={0}
          strokeWidth={interactionWidth}
          className="react-flow__edge-interaction"
          onClick={onClick}
        />
      )}
    </>
  );
};

type PositionHandler = {
  x: number;
  y: number;
  active?: number;
};

interface CustomEdgeData {
  positionHandlers?: PositionHandler[];
  type?: string;
}
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
  const positionHandlers: PositionHandler[] = Array.isArray(
    data?.positionHandlers
  )
    ? data.positionHandlers
    : [];
  const type = data?.type ?? "default";
  const edgeSegmentsCount = positionHandlers.length + 1;

  const edgeSegmentsArray: {
    edgePath: string;
    labelX: number;
    labelY: number;
  }[] = [];

  const pathFunction =
    type === "straight"
      ? getStraightPath
      : type === "smoothstep"
      ? getSmoothStepPath
      : getBezierPath;

  for (let i = 0; i < edgeSegmentsCount; i++) {
    const segmentSourceX =
      i === 0 ? sourceX : positionHandlers[i - 1]?.x ?? sourceX;
    const segmentSourceY =
      i === 0 ? sourceY : positionHandlers[i - 1]?.y ?? sourceY;
    const segmentTargetX =
      i === edgeSegmentsCount - 1 ? targetX : positionHandlers[i]?.x ?? targetX;
    const segmentTargetY =
      i === edgeSegmentsCount - 1 ? targetY : positionHandlers[i]?.y ?? targetY;

    const [edgePath, labelX, labelY] = pathFunction({
      sourceX: segmentSourceX,
      sourceY: segmentSourceY,
      sourcePosition,
      targetX: segmentTargetX,
      targetY: segmentTargetY,
      targetPosition,
    });
    edgeSegmentsArray.push({ edgePath, labelX, labelY });
  }

  const updateEdges = useCallback(
    (updater: (edges: Edge[]) => Edge[]) => {
      reactFlowInstance.setEdges((prevEdges) => updater([...prevEdges]));
    },
    [reactFlowInstance]
  );

  return (
    <>
      {edgeSegmentsArray.map(({ edgePath }, index) => (
        <ClickableBaseEdge
          id={`${id}_segment${index}`}
          onClick={(event) => {
            const position = reactFlowInstance.screenToFlowPosition({
              x: event.clientX,
              y: event.clientY,
            });

            updateEdges((edges) => {
              const edgeIndex = edges.findIndex((edge) => edge.id === id);
              if (edgeIndex !== -1) {
                const handlers = edges[edgeIndex]?.data?.positionHandlers;
                if (Array.isArray(handlers)) {
                  handlers.splice(index, 0, { x: position.x, y: position.y });
                }
              }
              return edges;
            });
          }}
          key={`edge${id}_segment${index}`}
          path={edgePath}
          markerEnd={markerEnd}
          style={style}
        />
      ))}
      {positionHandlers.map(({ x, y, active }, handlerIndex) => (
        <EdgeLabelRenderer key={`edge${id}_handler${handlerIndex}`}>
          <div
            className="nopan positionHandlerContainer"
            style={{
              transform: `translate(-50%, -50%) translate(${x}px,${y}px)`,
            }}
          >
            <div
              className={`positionHandlerEventContainer ${
                active !== undefined ? "active" : ""
              }`}
              data-active={active ?? -1}
              onMouseMove={(event) => {
                const target = event.target as HTMLElement;
                const activeEdge = parseInt(target.dataset.active ?? "-1", 10);
                if (activeEdge === -1) return;

                const position = reactFlowInstance.screenToFlowPosition({
                  x: event.clientX,
                  y: event.clientY,
                });

                updateEdges((edges) => {
                  const edge = edges[activeEdge];
                  if (Array.isArray(edge?.data?.positionHandlers)) {
                    edge.id = Math.random().toString();
                    edge.data.positionHandlers[handlerIndex] = {
                      x: position.x,
                      y: position.y,
                      active: activeEdge,
                    };
                  }
                  return edges;
                });
              }}
              onMouseUp={() => {
                updateEdges((edges) => {
                  edges.forEach((edge) => {
                    const handlers = edge.data?.positionHandlers;
                    if (Array.isArray(handlers)) {
                      handlers.forEach((handler) => {
                        if (handler) handler.active = -1;
                      });
                    }
                  });
                  return edges;
                });
              }}
            >
              <div
              onClick={ () => console.log("clicked", id, handlerIndex)}
                className="positionHandler"
                data-active={active ?? -1}
                onMouseDown={() => {
                  updateEdges((edges) => {
                    const edge = edges.find((e) => e.id === id);
                    if (Array.isArray(edge?.data?.positionHandlers)) {
                      edge.data.positionHandlers[handlerIndex].active =
                        handlerIndex;
                    }
                    return edges;
                  });
                }}
                onContextMenu={(event) => {
                  event.preventDefault();
                  updateEdges((edges) => {
                    const edge = edges.find((e) => e.id === id);
                    if (Array.isArray(edge?.data?.positionHandlers)) {
                      edge.data.positionHandlers.splice(handlerIndex, 1);
                    }
                    return edges;
                  });
                }}
              ></div>
            </div>
          </div>
        </EdgeLabelRenderer>
      ))}
    </>
  );
}
