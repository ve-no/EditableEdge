const test = () => {
  return (
	<div>test</div>
  )
}

export default test;
// import {
//   EdgeLabelRenderer,
//   EdgeProps,
//   useReactFlow,
//   getBezierPath,
//   getStraightPath,
//   getSmoothStepPath,
// } from "@xyflow/react";
// import "./PositionableEdge.css";
// import ClickableBaseEdge from "./ClickableBaseEdge";
// type PositionHandler = {
//   x: number;
//   y: number;
//   active?: number;
// };

// interface CustomEdgeData {
//   positionHandlers?: PositionHandler[];
//   type?: string;
// }
// interface CustomEdgeData extends Record<string, unknown> {
//   positionHandlers?: PositionHandler[];
//   type?: string;
// }
// interface CustomEdgeProps extends EdgeProps {
//   data?: CustomEdgeData;
// }

// export default function PositionableEdge({
//   id,
//   sourceX,
//   sourceY,
//   targetX,
//   targetY,
//   sourcePosition,
//   targetPosition,
//   style = {},
//   markerEnd,
//   data,
// }: CustomEdgeProps) {
//   const reactFlowInstance = useReactFlow();
//   const positionHandlers: PositionHandler[] = Array.isArray(
//     data?.positionHandlers
//   )
//     ? data.positionHandlers
//     : [];
//   const type = data?.type ?? "default";
//   const edgeSegmentsCount = positionHandlers.length + 1;

//   const edgeSegmentsArray: {
//     edgePath: string;
//     labelX: number;
//     labelY: number;
//   }[] = [];

//   const pathFunction =
//     type === "straight"
//       ? getStraightPath
//       : type === "smoothstep"
//       ? getSmoothStepPath
//       : getBezierPath;

//   for (let i = 0; i < edgeSegmentsCount; i++) {
//     const segmentSourceX =
//       i === 0 ? sourceX : positionHandlers[i - 1]?.x ?? sourceX;
//     const segmentSourceY =
//       i === 0 ? sourceY : positionHandlers[i - 1]?.y ?? sourceY;
//     const segmentTargetX =
//       i === edgeSegmentsCount - 1 ? targetX : positionHandlers[i]?.x ?? targetX;
//     const segmentTargetY =
//       i === edgeSegmentsCount - 1 ? targetY : positionHandlers[i]?.y ?? targetY;

//     const [edgePath, labelX, labelY] = pathFunction({
//       sourceX: segmentSourceX,
//       sourceY: segmentSourceY,
//       sourcePosition,
//       targetX: segmentTargetX,
//       targetY: segmentTargetY,
//       targetPosition,
//     });
//     edgeSegmentsArray.push({ edgePath, labelX, labelY });
//   }

//   return (
//     <>
//       {edgeSegmentsArray.map(({ edgePath }, index) => (
//         <ClickableBaseEdge
//           id={`${id}_segment${index}`}
//           onClick={(event) => {
//             const position = reactFlowInstance.screenToFlowPosition({
//               x: event.clientX,
//               y: event.clientY,
//             });
//             reactFlowInstance.setEdges((edges) => {
//               const edgeIndex = edges.findIndex((edge) => edge.id === id);
//               if (Array.isArray(edges)) {
//                 // edges[edgeIndex].id = Math.random().toString();
//                 if (Array.isArray(edges[edgeIndex]?.data?.positionHandlers))
//                   edges[edgeIndex].data.positionHandlers.splice(index, 0, {
//                     x: position.x,
//                     y: position.y,
//                   });
//               }
//               return edges;
//             });
//           }}
//           key={`edge${id}_segment${index}`}
//           path={edgePath}
//           markerEnd={markerEnd}
//           style={style}
//         />
//       ))}
//       {positionHandlers.map(({ x, y, active }, handlerIndex) => (
//         <EdgeLabelRenderer key={`edge${id}_handler${handlerIndex}`}>
//           <div
//             className="nopan positionHandlerContainer"
//             style={{
//               transform: `translate(-50%, -50%) translate(${x}px,${y}px)`,
//             }}
//           >
//             <div
//               className={`positionHandlerEventContainer ${
//                 active !== undefined ? "active" : ""
//               }`}
//               tabIndex={active ?? -1}
//               // onMouseMove={(event) => {

//               //   const target = event.target as HTMLElement;
//               //   const activeEdge = parseInt(target.dataset.active ?? "-1", 10);
//               //   if (activeEdge === -1) return;

//               //   const position = reactFlowInstance.screenToFlowPosition({
//               //     x: event.clientX,
//               //     y: event.clientY,
//               //   });
//               //   reactFlowInstance.setEdges((edges) => {
//               //     const edge = edges[activeEdge];
//               //     if (Array.isArray(edge?.data?.positionHandlers)) {
//               //       edge.id = Math.random().toString();
//               //       edge.data.positionHandlers[handlerIndex] = {
//               //         x: position.x,
//               //         y: position.y,
//               //         active: activeEdge,
//               //       };
//               //     }
//               //     return edges;
//               //   });
//               // }}
//               onMouseMove={(event) => {
//                 const target = event.target as HTMLElement;
//                 const activeEdge = parseInt(target.dataset.active ?? "-1", 10);
//                 if (activeEdge === -1) return;

//                 const position = reactFlowInstance.screenToFlowPosition({
//                     x: event.clientX,
//                     y: event.clientY,
//                 });

//                 console.log("Moving handler", { handlerIndex, position });

//                 reactFlowInstance.setEdges((edges) => {
//                     const edge = edges[activeEdge];
//                     if (Array.isArray(edge?.data?.positionHandlers)) {
//                         edge.data.positionHandlers[handlerIndex] = {
//                             x: position.x,
//                             y: position.y,
//                             active: activeEdge,
//                         };
//                         edge.id = `${id}-updated-${Date.now()}`; // Force re-render
//                     }
//                     return [...edges]; // Return new array reference
//                 });
//             }}


//               // onMouseUp={() => {
//               //   reactFlowInstance.setEdges((edges) => {
//               //     // const edgeIndex = edges.findIndex((edge) => edge.id === id);
//               //     for (let i = 0; i < edges.length; i++) {
//               //       const handlers = edges[i].data?.positionHandlers;
//               //       if (Array.isArray(handlers)) {
//               //         const handlersLength = handlers.length;
//               //         for (let j = 0; j < handlersLength; j++) {
//               //           handlers[j].active = -1;
//               //         }
//               //       }
//               //     }

//               //     return edges;
//               //   });
//               // }}
//               onMouseUp={() => {
//                 reactFlowInstance.setEdges((edges) =>
//                     edges.map((edge) => {
//                         if (Array.isArray(edge.data?.positionHandlers)) {
//                             edge.data.positionHandlers = edge.data.positionHandlers.map((handler) => ({
//                                 ...handler,
//                                 active: undefined,
//                             }));
//                         }
//                         return edge;
//                     })
//                 );
//             }}

//             >
//               <button
//                 className="positionHandler"
//                 data-active={active ?? -1}
//                 onMouseDown={() => {
//                   reactFlowInstance.setEdges((edges) => {
//                       return edges.map((edge) => {
//                           if (edge.id === id && Array.isArray(edge.data?.positionHandlers)) {
//                               edge.data.positionHandlers[handlerIndex].active = handlerIndex;
//                           }
//                           return edge;
//                       });
//                   });
//               }}

//                 // onContextMenu={(event) => {
//                 //   event.preventDefault();
//                 //   reactFlowInstance.setEdges((edges) => {
//                 //     const edgeIndex = edges.findIndex((edge) => edge.id === id);
//                 //     edges[edgeIndex].id = Math.random().toString();
//                 //     if (
//                 //       Array.isArray(edges[edgeIndex].data?.positionHandlers)
//                 //     ) {
//                 //       edges[edgeIndex].data.positionHandlers.splice(
//                 //         handlerIndex,
//                 //         1
//                 //       );
//                 //     }
//                 //     return edges;
//                 //   });
//                 // }}
//                 onContextMenu={(event) => {
//                   event.preventDefault();
//                   reactFlowInstance.setEdges((edges) => {
//                     return edges.map((edge) => {
//                       if (edge.id === id && Array.isArray(edge.data?.positionHandlers)) {
//                         edge.data.positionHandlers = edge.data.positionHandlers.filter(
//                           (_, idx) => idx !== handlerIndex
//                         );
//                       }
//                       return edge;
//                     });
//                   });
//               }}
//               ></button>
//             </div>
//           </div>
//         </EdgeLabelRenderer>
//       ))}
//     </>
//   );
// }
