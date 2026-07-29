import { LuWorkflow } from "react-icons/lu"

import { EmptyState } from "@/components/shared/empty-state"
import type { WorkflowDetail } from "@/modules/workflows/types"


export function WorkflowView({ workflow }: { workflow: WorkflowDetail }) {
  const nodeCount = workflow.graph?.nodes.length ?? 0

  return (
    <div className="flex flex-1 flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {workflow.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          Last edited{" "}
          {workflow.updatedAt.toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </header>

      <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed">
        <EmptyState
          icon={<LuWorkflow />}
          title={nodeCount === 0 ? "Empty canvas" : `${nodeCount} nodes`}
          description="The editor for this workflow is coming next."
        />
      </div>
    </div>
  )
}
