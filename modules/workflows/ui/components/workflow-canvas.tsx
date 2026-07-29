"use client"

import { useSyncExternalStore } from "react"
import { useTheme } from "next-themes"
import {
  ConnectionLineType,
  Controls,
  ReactFlow,
  type DefaultEdgeOptions,
  type Edge,
  type NodeTypes,
} from "@xyflow/react"
import { useLiveblocksFlow , Cursors} from "@liveblocks/react-flow"

import type { StepNodeType } from "@/modules/workflows/nodes/node-registry"
import { StepNode } from "@/modules/workflows/ui/components/step-node"

import "@xyflow/react/dist/style.css"
import "@liveblocks/react-ui/styles.css";
import "@liveblocks/react-flow/styles.css";



const nodeTypes: NodeTypes = {
  step: StepNode,
}

const initialNodes: StepNodeType[] = [
  {
    id: "n1",
    type: "step",
    position: { x: 0, y: 0 },
    data: { type: "start", kind: "trigger", title: "Start", values: {} },
  },
]

const initialEdges: Edge[] = []

const connectionLineStyle = { stroke: "var(--border)" }

const flowStyle = {
  "--xy-background-color": "var(--background)",
  "--xy-edge-stroke-width": 2,
  "--xy-connectionline-stroke-width": 2,
} as React.CSSProperties

const defaultEdgeOptions: DefaultEdgeOptions = {
  type: ConnectionLineType.SmoothStep,
  style: { stroke: "var(--border)" },
}


const subscribe = () => () => {}

function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
}

export function WorkflowCanvas() {
  const { resolvedTheme } = useTheme()
  const mounted = useMounted()
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onDelete,
  } = useLiveblocksFlow<StepNodeType, Edge>({
    suspense: true,
    nodes: { initial: initialNodes },
    edges: { initial: initialEdges },
  })

  return (
    <div className="size-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={connectionLineStyle}
        defaultEdgeOptions={defaultEdgeOptions}
        colorMode={mounted && resolvedTheme === "dark" ? "dark" : "light"}
        style={flowStyle}
        proOptions={{ hideAttribution: true }}
        fitView
        maxZoom={1}
      >
        <Controls />
        <Cursors />
      </ReactFlow>
    </div>
  )
}
