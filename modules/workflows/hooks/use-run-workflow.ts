"use client"

import { useCallback, useMemo, useState } from "react"
import { useRealtimeRun } from "@trigger.dev/react-hooks"

import {
  WORKFLOW_RUN_ACTIVE_STATUSES,
  WORKFLOW_RUN_FAILED_STATUSES,
  WORKFLOW_RUN_STATUS_LABELS,
} from "@/modules/workflows/constants"
import { runWorkflowAction } from "@/modules/workflows/server/actions"
import type {
  WorkflowRunHandle,
  WorkflowRunProgress,
} from "@/modules/workflows/types"
import { runWorkflowSchema } from "@/modules/workflows/validators"
import type { helloWorldTask } from "@/trigger/example"

type UseRunWorkflowOptions = {
  onStarted?: (handle: WorkflowRunHandle) => void
  onFinished?: (status: string) => void
}

export type WorkflowRunState = {
  status: string
  label: string
  tone: "active" | "success" | "failure"
  progress: WorkflowRunProgress
  output: { message: string } | null
  errorMessage: string | null
}

export function useRunWorkflow({
  onStarted,
  onFinished,
}: UseRunWorkflowOptions = {}) {
  const [isTriggering, setIsTriggering] = useState(false)
  const [handle, setHandle] = useState<WorkflowRunHandle | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { run, error: realtimeError } = useRealtimeRun<typeof helloWorldTask>(
    handle?.runId,
    {
      accessToken: handle?.publicAccessToken,
      // Only subscribe once a run actually exists.
      enabled: handle !== null,
      // The payload is just the message we sent — nothing to render from it.
      skipColumns: ["payload"],
      onComplete: (completed) => onFinished?.(completed.status),
    }
  )

  const state = useMemo<WorkflowRunState | null>(() => {
    if (!run) {
      return null
    }

    const isFailure = WORKFLOW_RUN_FAILED_STATUSES.has(run.status)
    const isActive = WORKFLOW_RUN_ACTIVE_STATUSES.has(run.status)

    return {
      status: run.status,
      label: WORKFLOW_RUN_STATUS_LABELS[run.status] ?? run.status,
      tone: isFailure ? "failure" : isActive ? "active" : "success",
      progress: (run.metadata ?? {}) as WorkflowRunProgress,
      output: run.output ?? null,
      errorMessage: run.error?.message ?? null,
    }
  }, [run])

  const start = useCallback(
    async (workflowId: string) => {
      setError(null)

      const parsed = runWorkflowSchema.safeParse({ workflowId })

      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message ?? null)
        return null
      }

      setHandle(null)
      setIsTriggering(true)

      const result = await runWorkflowAction(parsed.data)

      setIsTriggering(false)

      if (result.error) {
        setError(result.error.message)
        return null
      }

      setHandle(result.data)
      onStarted?.(result.data)

      return result.data
    },
    [onStarted]
  )

  const clearError = useCallback(() => setError(null), [])

  // Keep the button locked from the click until the run reaches a terminal state.
  const isRunActive =
    handle !== null && (!state || state.tone === "active")

  return {
    start,
    handle,
    state,
    isPending: isTriggering || isRunActive,
    error: error ?? realtimeError?.message ?? null,
    clearError,
  }
}
