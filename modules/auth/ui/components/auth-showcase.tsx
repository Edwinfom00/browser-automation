"use client"

import type { IconType } from "react-icons"
import { LuBot, LuGlobe, LuMousePointerClick, LuTable2 } from "react-icons/lu"
import type { Node, NodeProps, NodeTypes } from "@xyflow/react"

import {
  FlowPreview,
  FlowSourceHandle,
  FlowTargetHandle,
  flowEdgeChain,
  flowNode,
} from "@/components/shared/flow-preview"
import { cn } from "@/lib/utils"
import { AuthLogo } from "@/modules/auth/ui/components/auth-brand"

/* Node geometry — mirrored by the markup below so server and client agree. */
const HEADER_HEIGHT = 68
const FIELD_HEIGHT = 37

const EDGE_COLOR = "rgba(255, 255, 255, 0.14)"
const TARGET_HANDLE_COLOR = "rgba(255, 255, 255, 0.28)"

type ShowcaseStep = {
  label: string
  icon: IconType
  tone: string
  duration: string
  /** Ring color on the outgoing handle. */
  accent?: string
  field?: { label: string; value: string }
  /** Position and width come straight from the design. */
  x: number
  y: number
  width: number
}

const WORKFLOW: ShowcaseStep[] = [
  {
    label: "Start",
    icon: LuMousePointerClick,
    tone: "bg-blue-600",
    duration: "372ms",
    accent: "var(--color-blue-500)",
    x: 0,
    y: 0,
    width: 260,
  },
  {
    label: "Open URL",
    icon: LuGlobe,
    tone: "bg-emerald-500",
    duration: "10.5s",
    field: {
      label: "URL",
      value: "https://www.porsche.com/usa/models/911/",
    },
    x: 112,
    y: 129,
    width: 344,
  },
  {
    label: "Agent",
    icon: LuBot,
    tone: "bg-rose-500",
    duration: "8.2s",
    field: { label: "Instruction", value: "Open the 911 configurator" },
    x: 176,
    y: 285,
    width: 316,
  },
  {
    label: "Extract",
    icon: LuTable2,
    tone: "bg-amber-500",
    duration: "2m 42.8s",
    field: {
      label: "Instruction",
      value: "The shareable link (full URL) to the configurator",
    },
    x: 290,
    y: 445,
    width: 340,
  },
]

function NodeIcon({
  icon: Icon,
  tone,
  className,
}: {
  icon: IconType
  tone: string
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-lg text-white [&_svg]:size-5",
        tone,
        className
      )}
    >
      <Icon />
    </span>
  )
}

type ShowcaseNodeData = {
  label: string
  icon: IconType
  tone: string
  accent?: string
  field?: { label: string; value: string }
}

type ShowcaseNode = Node<ShowcaseNodeData, "showcase">

function ShowcaseNode({ data }: NodeProps<ShowcaseNode>) {
  return (
    <div className="size-full overflow-hidden rounded-xl border border-white/[0.09] bg-neutral-900/70 shadow-2xl shadow-black/40">
      <FlowTargetHandle color={TARGET_HANDLE_COLOR} />

      <div
        className="flex items-center gap-4 px-4"
        style={{ height: HEADER_HEIGHT }}
      >
        <NodeIcon icon={data.icon} tone={data.tone} />
        <span className="text-[15px] font-medium text-neutral-50">
          {data.label}
        </span>
      </div>

      {data.field ? (
        <div
          className="flex items-center justify-between gap-4 border-t border-white/[0.07] px-4"
          style={{ height: FIELD_HEIGHT - 1 }}
        >
          <span className="text-xs text-neutral-500">{data.field.label}</span>
          <span className="truncate text-xs text-neutral-300">
            {data.field.value}
          </span>
        </div>
      ) : null}

      <FlowSourceHandle color={data.accent ?? "rgba(255, 255, 255, 0.24)"} />
    </div>
  )
}

const nodeTypes: NodeTypes = { showcase: ShowcaseNode }

const nodes = WORKFLOW.map((step) =>
  flowNode<ShowcaseNodeData>({
    id: step.label,
    type: "showcase",
    data: {
      label: step.label,
      icon: step.icon,
      tone: step.tone,
      accent: step.accent,
      field: step.field,
    },
    x: step.x,
    y: step.y,
    width: step.width,
    height: HEADER_HEIGHT + (step.field ? FIELD_HEIGHT : 0),
  })
)

const edges = flowEdgeChain(
  WORKFLOW.map((step) => step.label),
  { style: { stroke: EDGE_COLOR } }
)

export function AuthShowcase({ className }: { className?: string }) {
  return (
    <aside
      aria-hidden
      className={cn(
        "relative flex overflow-hidden bg-neutral-950 text-neutral-100 select-none",
        className
      )}
    >
      <div className="flex w-20 shrink-0 flex-col items-center gap-10 border-r border-white/[0.07] py-6">
        <AuthLogo size="sm" />
        <span className="[writing-mode:vertical-rl] rotate-180 text-[10px] tracking-[0.35em] text-neutral-600 uppercase">
          Automation / 001
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 px-6 py-8">
          <FlowPreview
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            colorMode="dark"
            edgeColor={EDGE_COLOR}
            padding={0.06}
            width={700}
            height={620}
          />
        </div>

        <div className="border-t border-white/[0.07] px-10 py-8">
          <p className="text-[11px] tracking-[0.18em] text-neutral-500 uppercase">
            Logs
          </p>
          <ul className="mt-5 flex flex-col gap-4">
            {WORKFLOW.map((step) => (
              <li key={step.label} className="flex items-center gap-3">
                <NodeIcon
                  icon={step.icon}
                  tone={step.tone}
                  className="size-6 rounded-md [&_svg]:size-3.5"
                />
                <span className="text-sm text-neutral-200">{step.label}</span>
                <span className="ml-auto text-sm text-neutral-500 tabular-nums">
                  {step.duration}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  )
}
