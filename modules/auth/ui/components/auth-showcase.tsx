import type { IconType } from "react-icons"
import { LuBot, LuGlobe, LuMousePointerClick, LuTable2 } from "react-icons/lu"

import { cn } from "@/lib/utils"
import { AuthLogo } from "@/modules/auth/ui/components/auth-brand"

type WorkflowNode = {
  label: string
  icon: IconType
  tone: string
  duration: string
  field?: { label: string; value: string }
}

const WORKFLOW: WorkflowNode[] = [
  {
    label: "Start",
    icon: LuMousePointerClick,
    tone: "bg-blue-600",
    duration: "372ms",
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
  },
  {
    label: "Agent",
    icon: LuBot,
    tone: "bg-rose-500",
    duration: "8.2s",
    field: { label: "Instruction", value: "Open the 911 configurator" },
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
        "grid size-7 shrink-0 place-items-center rounded-lg text-white [&_svg]:size-4",
        tone,
        className
      )}
    >
      <Icon />
    </span>
  )
}

function WorkflowCard({ node }: { node: WorkflowNode }) {
  return (
    <div className="w-[23rem] max-w-full rounded-xl border border-white/10 bg-neutral-900/60 shadow-2xl shadow-black/40 backdrop-blur-sm">
      <div className="flex items-center gap-3 px-3 py-2.5">
        <NodeIcon icon={node.icon} tone={node.tone} />
        <span className="text-sm font-medium text-neutral-50">
          {node.label}
        </span>
      </div>
      {node.field ? (
        <div className="flex items-center justify-between gap-4 border-t border-white/[0.07] px-3 py-2.5">
          <span className="text-xs text-neutral-500">{node.field.label}</span>
          <span className="truncate text-xs text-neutral-300">
            {node.field.value}
          </span>
        </div>
      ) : null}
    </div>
  )
}

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
        <div className="flex min-h-0 flex-1 items-center overflow-hidden px-10 py-12">
          <div className="flex flex-col">
            {WORKFLOW.map((node, index) => (
              <div key={node.label} className="flex flex-col">
                {index > 0 ? (
                  <div className="ml-6 h-8 w-12 rounded-bl-lg border-b border-l border-white/10" />
                ) : null}
                <div style={{ marginLeft: `${index * 3}rem` }}>
                  <WorkflowCard node={node} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/[0.07] px-10 py-8">
          <p className="text-[11px] tracking-[0.18em] text-neutral-500 uppercase">
            Logs
          </p>
          <ul className="mt-5 flex flex-col gap-4">
            {WORKFLOW.map((node) => (
              <li key={node.label} className="flex items-center gap-3">
                <NodeIcon
                  icon={node.icon}
                  tone={node.tone}
                  className="size-6 rounded-md [&_svg]:size-3.5"
                />
                <span className="text-sm text-neutral-200">{node.label}</span>
                <span className="ml-auto text-sm text-neutral-500 tabular-nums">
                  {node.duration}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  )
}
