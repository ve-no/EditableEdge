import React from "react";
import {
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  getSmoothStepPath,
  getStraightPath,
  useReactFlow,
} from "reactflow";
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

import "./PositionableEdge.css";

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
}: EdgeProps) {
  const reactFlowInstance = useReactFlow();
  const positionHandlers = data?.positionHandlers ?? [];
  const type = data?.type ?? "default";
  const edgeSegmentsCount = positionHandlers.length + 1;
  let edgeSegmentsArray = [];

  let pathFunction;
  console.log(type);
  switch (type) {
    case "straight":
      pathFunction = getStraightPath;
      break;
    case "smoothstep":
      pathFunction = getSmoothStepPath;
      break;
    default:
      pathFunction = getBezierPath;
  }

  for (let i = 0; i < edgeSegmentsCount; i++) {
    let segmentSourceX, segmentSourceY, segmentTargetX, segmentTargetY;

    if (i === 0) {
      segmentSourceX = sourceX;
      segmentSourceY = sourceY;
    } else {
      const handler = positionHandlers[i - 1];
      segmentSourceX = handler.x;
      segmentSourceY = handler.y;
    }

    if (i === edgeSegmentsCount - 1) {
      segmentTargetX = targetX;
      segmentTargetY = targetY;
    } else {
      const handler = positionHandlers[i];
      segmentTargetX = handler.x;
      segmentTargetY = handler.y;
    }

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

  return (
    <>
      {edgeSegmentsArray.map(({ edgePath }, index) => (
        <ClickableBaseEdge
          id={`${id}_segment${index}`}
          onClick={(event: React.MouseEvent<SVGPathElement, MouseEvent>) => {
            const position = reactFlowInstance.screenToFlowPosition({
              x: event.clientX,
              y: event.clientY,
            });

            reactFlowInstance.setEdges((edges) => {
              const edgeIndex = edges.findIndex((edge) => edge.id === id);

              edges[edgeIndex].data.positionHandlers.splice(index, 0, {
                x: position.x,
                y: position.y,
              });
              return edges;
            });
          }}
          key={`edge${id}_segment${index}`}
          path={edgePath}
          markerEnd={markerEnd}
          style={style}
        />
      ))}
      {positionHandlers.map(
        (
          { x, y, active }: { x: number; y: number; active?: number },
          handlerIndex: number
        ) => (
          <EdgeLabelRenderer key={`edge${id}_handler${handlerIndex}`}>
            <div
              className="nopan positionHandlerContainer"
              style={{
                transform: `translate(-50%, -50%) translate(${x}px,${y}px)`,
              }}
            >
              <div
                className={`positionHandlerEventContainer ${active} ${
                  `${active ?? -1}` !== "-1" ? "active" : ""
                }`}
                data-active={active ?? -1}
                onMouseMove={(event: React.MouseEvent) => {
                  const target = event.target as HTMLElement;

                  const activeEdge = parseInt(target.dataset.active ?? "-1", 10);
                  if (activeEdge === -1) {
                    return;
                  }
                  const position = reactFlowInstance.screenToFlowPosition({
                    x: event.clientX,
                    y: event.clientY,
                  });
                  reactFlowInstance.setEdges((edges) => {
                    edges[activeEdge].id = Math.random().toString();
                    edges[activeEdge].data.positionHandlers[handlerIndex] = {
                      x: position.x,
                      y: position.y,
                      active: activeEdge,
                    };
                    return edges;
                  });

                }}
                onMouseUp={() => {
                  reactFlowInstance.setEdges((edges) => {
                    for (let i = 0; i < edges.length; i++) {
                      const handlersLength =
                        edges[i].data.positionHandlers.length;
                      for (let j = 0; j < handlersLength; j++) {
                        edges[i].data.positionHandlers[j].active = -1;
                      }
                    }

                    return edges;
                  });
                }}
              >
                <button
                  className="positionHandler"
                  data-active={active ?? -1}
                  onMouseDown={() => {
                    reactFlowInstance.setEdges((edges) => {
                      const edgeIndex = edges.findIndex(
                        (edge) => edge.id === id
                      );
                      edges[edgeIndex].data.positionHandlers[
                        handlerIndex
                      ].active = edgeIndex;
                      return edges;
                    });
                  }}
                  onContextMenu={(event: React.MouseEvent) => {
                    event.preventDefault();
                    reactFlowInstance.setEdges((edges) => {
                      const edgeIndex = edges.findIndex(
                        (edge) => edge.id === id
                      );
                      edges[edgeIndex].id = Math.random().toString();
                      edges[edgeIndex].data.positionHandlers.splice(
                        handlerIndex,
                        1
                      );
                      return edges;
                    });
                  }}
                ></button>
              </div>
            </div>
          </EdgeLabelRenderer>
        )
      )}
    </>
  );
}
