"use client"

import type { Node, NodeProps, NodeTypes } from "@xyflow/react"

import {
  FlowPreview,
  FlowSourceHandle,
  FlowTargetHandle,
  flowChain,
} from "@/components/shared/flow-preview"
import { Loader } from "@/components/shared/loading"
import { Skeleton } from "@/components/ui/skeleton"

/* Node geometry — mirrored by the markup below, and by the real canvas node. */
const HEADER_HEIGHT = 68
const FIELD_HEIGHT = 37
const NODE_HEIGHT = HEADER_HEIGHT + FIELD_HEIGHT
const NODE_WIDTH = 316
const NODE_GAP = 56
const NODE_INDENT = 64

const GHOST_COUNT = 3

type GhostNodeData = { delay: number }

type GhostNode = Node<GhostNodeData, "ghost">

function GhostNode({ data }: NodeProps<GhostNode>) {
  return (
    <div
      className="size-full overflow-hidden rounded-xl border border-border bg-card shadow-sm shadow-foreground/[0.04] motion-safe:animate-rise"
      style={{ animationDelay: `${data.delay}ms` }}
    >
      <FlowTargetHandle />

      <div
        className="flex items-center gap-4 px-4"
        style={{ height: HEADER_HEIGHT }}
      >
        <Skeleton className="size-9 rounded-lg" delay={data.delay} />
        <Skeleton className="h-3.5 w-24" delay={data.delay} />
      </div>

      <div
        className="flex items-center justify-between gap-4 border-t border-border px-4"
        style={{ height: FIELD_HEIGHT - 1 }}
      >
        <Skeleton className="h-3 w-14" delay={data.delay} />
        <Skeleton className="h-3 w-32" delay={data.delay} />
      </div>

      <FlowSourceHandle />
    </div>
  )
}

const nodeTypes: NodeTypes = { ghost: GhostNode }

const { nodes, edges } = flowChain<GhostNodeData>({
  type: "ghost",
  width: NODE_WIDTH,
  gap: NODE_GAP,
  indent: NODE_INDENT,
  steps: Array.from({ length: GHOST_COUNT }, (_, index) => ({
    id: `ghost-${index}`,
    height: NODE_HEIGHT,
    data: { delay: index * 90 },
  })),
})

export function WorkflowViewSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading workflow"
      className="flex flex-1 flex-col gap-6"
    >
      <header className="flex flex-col gap-2">
        <Skeleton className="h-7 w-56 rounded-lg" />
        <Skeleton className="h-4 w-44" />
      </header>

      <div className="relative flex-1 overflow-hidden rounded-xl border border-dashed border-border">
        <FlowPreview
          aria-hidden
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          padding={0.12}
          width={520}
          height={460}
        />

        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2.5 rounded-full border border-border bg-background/80 px-3.5 py-1.5 shadow-sm backdrop-blur-sm">
          <Loader size="xs" />
          <span className="text-xs font-medium text-muted-foreground">
            Loading workflow…
          </span>
        </div>
      </div>
    </div>
  )
}
