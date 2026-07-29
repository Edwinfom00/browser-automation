"use client"

import { LuLoaderCircle, LuPlay } from "react-icons/lu"

import { Button } from "@/components/ui/button"
import { useRunWorkflow } from "@/modules/workflows/hooks/use-run-workflow"
import { WorkflowRunFeedback } from "@/modules/workflows/ui/components/workflow-run-feedback"


export function RightSidebar({ workflowId }: { workflowId: string }) {
  const { start, handle, state, isPending, error } = useRunWorkflow()

  return (
    <div className="flex size-full flex-col gap-3 p-3">
      <Button
        size="sm"
        disabled={isPending}
        onClick={() => void start(workflowId)}
      >
        {isPending ? (
          <LuLoaderCircle data-icon="inline-start" className="animate-spin" />
        ) : (
          <LuPlay data-icon="inline-start" />
        )}
        {isPending ? "Running…" : "Run"}
      </Button>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {handle ? (
        <WorkflowRunFeedback runId={handle.runId} state={state} />
      ) : null}
    </div>
  )
}
