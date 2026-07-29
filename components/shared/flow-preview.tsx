"use client"

import { useSyncExternalStore } from "react"
import { useTheme } from "next-themes"
import {
  Background,
  BackgroundVariant,
  ConnectionLineType,
  Handle,
  Position,
  ReactFlow,
  type ColorMode,
  type DefaultEdgeOptions,
  type Edge,
  type Node,
  type NodeHandle,
  type NodeTypes,
} from "@xyflow/react"

import "@xyflow/react/dist/style.css"

import { cn } from "@/lib/utils"

const subscribe = () => () => {}

/**
 * React Flow needs `colorMode` up front, but next-themes only resolves on the
 * client. Render light on the server, then swap once mounted.
 */
export function useFlowColorMode(override?: ColorMode): ColorMode {
  const { resolvedTheme } = useTheme()
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )

  if (override) return override

  return mounted && resolvedTheme === "dark" ? "dark" : "light"
}

/* ------------------------------------------------------------------ handles */

const SOURCE_HANDLE_SIZE = 14
const TARGET_HANDLE_WIDTH = 8
const TARGET_HANDLE_HEIGHT = 11

/**
 * The ring outgoing edges leave from, on the node's right edge. Geometry is
 * inline so it overrides React Flow's own `.react-flow__handle` rules.
 */
export function FlowSourceHandle({ color }: { color?: string }) {
  return (
    <Handle
      type="source"
      position={Position.Right}
      style={{
        width: SOURCE_HANDLE_SIZE,
        height: SOURCE_HANDLE_SIZE,
        minWidth: 0,
        minHeight: 0,
        right: -SOURCE_HANDLE_SIZE / 2,
        borderRadius: "9999px",
        border: `2px solid ${color ?? "var(--border)"}`,
        background: "transparent",
      }}
    />
  )
}

/** The stub incoming edges land on, on the node's left edge. */
export function FlowTargetHandle({ color }: { color?: string }) {
  return (
    <Handle
      type="target"
      position={Position.Left}
      style={{
        width: TARGET_HANDLE_WIDTH,
        height: TARGET_HANDLE_HEIGHT,
        minWidth: 0,
        minHeight: 0,
        left: -TARGET_HANDLE_WIDTH / 2,
        borderRadius: 2,
        border: "none",
        background: color ?? "var(--border)",
      }}
    />
  )
}

/* -------------------------------------------------------------- graph model */

const handleOffset: Record<
  Position,
  (width: number, height: number) => { x: number; y: number }
> = {
  [Position.Top]: (width) => ({ x: width / 2, y: 0 }),
  [Position.Bottom]: (width, height) => ({ x: width / 2, y: height }),
  [Position.Left]: (_width, height) => ({ x: 0, y: height / 2 }),
  [Position.Right]: (width, height) => ({ x: width, y: height / 2 }),
}

export type FlowNodeInit<Data extends Record<string, unknown>> = {
  id: string
  type: string
  data: Data
  x: number
  y: number
  width: number
  height: number
  /** Where outgoing edges leave the node. */
  source?: Position
  /** Where incoming edges arrive. */
  target?: Position
}

/**
 * Builds a static node with the `width`/`height`/`handles` React Flow needs to
 * lay out nodes *and* draw edges during server rendering — without them a
 * decorative flow paints empty until the client measures the DOM.
 */
export function flowNode<Data extends Record<string, unknown>>({
  id,
  type,
  data,
  x,
  y,
  width,
  height,
  source = Position.Right,
  target = Position.Left,
}: FlowNodeInit<Data>): Node<Data> {
  const handles: NodeHandle[] = [
    {
      type: "target",
      position: target,
      ...handleOffset[target](width, height),
    },
    {
      type: "source",
      position: source,
      ...handleOffset[source](width, height),
    },
  ]

  return {
    id,
    type,
    data,
    position: { x, y },
    width,
    height,
    handles,
    draggable: false,
    selectable: false,
    connectable: false,
    focusable: false,
  }
}

export function flowEdge(
  source: string,
  target: string,
  options?: Partial<Edge>
): Edge {
  return {
    id: `${source}-${target}`,
    source,
    target,
    type: ConnectionLineType.Step,
    focusable: false,
    selectable: false,
    ...options,
  }
}

/** Wires each id to the next, in order. */
export function flowEdgeChain(ids: string[], options?: Partial<Edge>): Edge[] {
  return ids.slice(1).map((id, index) => flowEdge(ids[index], id, options))
}

export type FlowChainStep<Data extends Record<string, unknown>> = {
  id: string
  data: Data
  /** Node heights vary per step, so each one declares its own. */
  height: number
  /** Overrides the chain's shared width. */
  width?: number
  /** Overrides the chain's shared indent, in px from the left. */
  x?: number
}

/**
 * Lays out steps as the indented top-to-bottom staircase the auth and loading
 * surfaces use, wiring each step to the next. Edges leave the right edge and
 * wrap back into the next node's left edge, so `gap` needs room for the turn.
 */
export function flowChain<Data extends Record<string, unknown>>({
  type,
  steps,
  width,
  gap = 56,
  indent = 48,
  edgeOptions,
}: {
  type: string
  steps: FlowChainStep<Data>[]
  width: number
  gap?: number
  indent?: number
  edgeOptions?: Partial<Edge>
}): { nodes: Node[]; edges: Edge[] } {
  let y = 0

  const nodes = steps.map((step, index) => {
    const node = flowNode<Data>({
      id: step.id,
      type,
      data: step.data,
      x: step.x ?? index * indent,
      y,
      width: step.width ?? width,
      height: step.height,
    })

    y += step.height + gap

    return node as Node
  })

  return {
    nodes,
    edges: flowEdgeChain(
      steps.map((step) => step.id),
      edgeOptions
    ),
  }
}

/* ------------------------------------------------------------------ surface */

const defaultEdgeOptions: DefaultEdgeOptions = {
  type: ConnectionLineType.Step,
  focusable: false,
  selectable: false,
}

export type FlowPreviewProps = {
  nodes: Node[]
  edges: Edge[]
  nodeTypes: NodeTypes
  className?: string
  /** Force a color scheme; defaults to the app theme. */
  colorMode?: ColorMode
  /** Stroke for every edge. Accepts CSS colors and custom properties. */
  edgeColor?: string
  /** Dotted canvas grid. Off by default — decorative flows read cleaner without it. */
  background?: boolean
  backgroundColor?: string
  /** `fitView` padding, as a fraction of the viewport. */
  padding?: number
  maxZoom?: number
  /** Initial viewport size used for the server-rendered `fitView`. */
  width?: number
  height?: number
} & Pick<React.ComponentProps<"div">, "aria-hidden">

/**
 * A non-interactive React Flow surface for the decorative graphs that appear
 * outside the editor (auth, onboarding, loading states). Every pointer
 * affordance is disabled so it behaves like an image.
 */
export function FlowPreview({
  nodes,
  edges,
  nodeTypes,
  className,
  colorMode,
  edgeColor = "var(--border)",
  background = false,
  backgroundColor,
  padding = 0.1,
  maxZoom = 0.99,
  width,
  height,
  ...props
}: FlowPreviewProps) {
  const resolvedColorMode = useFlowColorMode(colorMode)

  return (
    <div className={cn("size-full", className)} {...props}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        colorMode={resolvedColorMode}
        width={width}
        height={height}
        fitView
        fitViewOptions={{ padding, maxZoom }}
        minZoom={0.2}
        maxZoom={maxZoom}
        nodesDraggable={false}
        nodesConnectable={false}
        nodesFocusable={false}
        edgesFocusable={false}
        edgesReconnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        panOnScroll={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        style={
          {
            "--xy-edge-stroke": edgeColor,
            "--xy-edge-stroke-width": 1.5,
            "--xy-background-color": backgroundColor ?? "transparent",
          } as React.CSSProperties
        }
      >
        {background ? (
          <Background variant={BackgroundVariant.Dots} gap={18} size={1} />
        ) : null}
      </ReactFlow>
    </div>
  )
}
