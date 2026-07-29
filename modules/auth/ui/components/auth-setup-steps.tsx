"use client"

import { useMemo } from "react"
import type { Node, NodeProps, NodeTypes } from "@xyflow/react"

import {
  FlowPreview,
  FlowSourceHandle,
  FlowTargetHandle,
  flowChain,
} from "@/components/shared/flow-preview"
import { cn } from "@/lib/utils"

export type SetupStep = {
  id: string
  label: string
}

export const SETUP_STEPS: SetupStep[] = [
  { id: "01", label: "Account" },
  { id: "02", label: "Verify" },
  { id: "03", label: "Workspace" },
]

/* Node geometry — mirrored by the markup below so server and client agree. */
const NODE_WIDTH = 296
const NODE_HEIGHT = 72
const NODE_GAP = 80
const NODE_INDENT = 40

type SetupNodeData = {
  step: SetupStep
  isActive: boolean
}

type SetupNode = Node<SetupNodeData, "setup">

function SetupNode({ data }: NodeProps<SetupNode>) {
  const { step, isActive } = data

  return (
    <div
      className={cn(
        "flex size-full items-center gap-4 rounded-xl border px-4",
        isActive ? "border-blue-500 bg-blue-500/[0.04]" : "border-border"
      )}
    >
      <FlowTargetHandle />

      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-lg text-sm font-semibold tabular-nums",
          isActive ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground"
        )}
      >
        {step.id}
      </span>

      <span
        className={cn(
          "text-sm font-medium tracking-[0.14em] uppercase",
          isActive ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {step.label}
      </span>

      <FlowSourceHandle
        color={isActive ? "var(--color-blue-500)" : "var(--border)"}
      />
    </div>
  )
}

const nodeTypes: NodeTypes = { setup: SetupNode }

function buildSteps(activeStep: number) {
  return flowChain<SetupNodeData>({
    type: "setup",
    width: NODE_WIDTH,
    gap: NODE_GAP,
    indent: NODE_INDENT,
    steps: SETUP_STEPS.map((step, index) => ({
      id: step.id,
      height: NODE_HEIGHT,
      data: { step, isActive: index === activeStep },
    })),
  })
}

export function AuthSetupSteps({
  activeStep = 0,
  className,
}: {
  activeStep?: number
  className?: string
}) {
  const { nodes, edges } = useMemo(() => buildSteps(activeStep), [activeStep])

  return (
    <div className={cn("h-[23rem] w-full max-w-md select-none", className)}>
      {/* The canvas is decorative; this list carries the semantics. */}
      <ol className="sr-only" aria-label="Sign-up steps">
        {SETUP_STEPS.map((step, index) => (
          <li
            key={step.id}
            aria-current={index === activeStep ? "step" : undefined}
          >
            {step.id} {step.label}
          </li>
        ))}
      </ol>

      <FlowPreview
        aria-hidden
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        padding={0.06}
        width={440}
        height={368}
      />
    </div>
  )
}
