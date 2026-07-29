"use client"

import { useCallback, useState, useSyncExternalStore } from "react"
import { useTheme } from "next-themes"
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  ConnectionLineType,
  Controls,
  ReactFlow,
  type DefaultEdgeOptions,
  type Edge,
  type EdgeChange,
  type NodeChange,
  type NodeTypes,
  type Connection,
} from "@xyflow/react"

import type { StepNodeType } from "@/modules/workflows/nodes/node-registry"
import { StepNode } from "@/modules/workflows/ui/components/step-node"

import "@xyflow/react/dist/style.css"


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
  const [nodes, setNodes] = useState<StepNodeType[]>(initialNodes)
  const [edges, setEdges] = useState<Edge[]>(initialEdges)

  const onNodesChange = useCallback(
    (changes: NodeChange<StepNodeType>[]) =>
      setNodes((current) => applyNodeChanges(changes, current)),
    [],
  )

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((current) => applyEdgeChanges(changes, current)),
    [],
  )

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((current) => addEdge(connection, current)),
    [],
  )

  return (
    <div className="size-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
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
      </ReactFlow>
    </div>
  )
}
