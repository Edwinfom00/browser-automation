"use client"

import {
  LuCircleCheck,
  LuCircleX,
  LuLoaderCircle,
} from "react-icons/lu"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { WorkflowRunState } from "@/modules/workflows/hooks/use-run-workflow"

const TONE_BADGE = {
  active: "secondary",
  success: "default",
  failure: "destructive",
} as const

function ToneIcon({ tone }: { tone: WorkflowRunState["tone"] }) {
  if (tone === "active") {
    return <LuLoaderCircle data-icon="inline-start" className="animate-spin" />
  }

  if (tone === "failure") {
    return <LuCircleX data-icon="inline-start" />
  }

  return <LuCircleCheck data-icon="inline-start" />
}


export function WorkflowRunFeedback({
  runId,
  state,
}: {
  runId: string
  state: WorkflowRunState | null
}) {
 
  if (!state) {
    return (
      <div className="flex flex-col gap-2 rounded-lg border p-3">
        <Badge variant="secondary">
          <LuLoaderCircle data-icon="inline-start" className="animate-spin" />
          Connecting
        </Badge>
        <p className="truncate font-mono text-xs text-muted-foreground">
          {runId}
        </p>
      </div>
    )
  }

  const percentage = state.progress.progress

  return (
    <div className="flex flex-col gap-2 rounded-lg border p-3">
      <div className="flex items-center justify-between gap-2">
        <Badge variant={TONE_BADGE[state.tone]}>
          <ToneIcon tone={state.tone} />
          {state.label}
        </Badge>

        {typeof percentage === "number" ? (
          <span className="text-xs tabular-nums text-muted-foreground">
            {percentage}%
          </span>
        ) : null}
      </div>

      {typeof percentage === "number" ? (
        <Progress value={percentage} />
      ) : null}

      {state.progress.label ? (
        <p className="text-xs text-muted-foreground">{state.progress.label}</p>
      ) : null}

      {state.errorMessage ? (
        <p role="alert" className="text-xs text-destructive">
          {state.errorMessage}
        </p>
      ) : null}

      {state.output ? (
        <p className="text-xs text-muted-foreground">{state.output.message}</p>
      ) : null}

      <p className="truncate font-mono text-[0.7rem] text-muted-foreground/70">
        {runId}
      </p>
    </div>
  )
}
