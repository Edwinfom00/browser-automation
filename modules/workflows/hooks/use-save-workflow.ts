"use client"

import { useCallback, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useReactFlow, type Edge } from "@xyflow/react"

import { serializeWorkflowGraph } from "@/modules/workflows/lib/serialize-graph"
import type { StepNodeType } from "@/modules/workflows/nodes/node-registry"
import { saveWorkflow } from "@/modules/workflows/server/actions"
import type {
  WorkflowGraphStatus,
  WorkflowSaveResult,
} from "@/modules/workflows/types"

type UseSaveWorkflowOptions = {
  workflowId: string
  onSaved?: (result: WorkflowSaveResult) => void
}

export function useSaveWorkflow({
  workflowId,
  onSaved,
}: UseSaveWorkflowOptions) {
  const router = useRouter()

  const { getNodes, getEdges } = useReactFlow<StepNodeType, Edge>()
  const [isSaving, setIsSaving] = useState(false)
  const [isRefreshing, startRefresh] = useTransition()
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [status, setStatus] = useState<WorkflowGraphStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  const save = useCallback(async () => {
    setError(null)
    setIsSaving(true)

    const result = await saveWorkflow({
      workflowId,
      graph: serializeWorkflowGraph(getNodes(), getEdges()),
    })

    setIsSaving(false)

    if (result.error) {
      setError(result.error.message)
      return null
    }

    setStatus(result.data.graph)
    setSavedAt(result.data.workflow.updatedAt)
    onSaved?.(result.data)
    startRefresh(() => router.refresh())

    return result.data
  }, [getEdges, getNodes, onSaved, router, workflowId])

  const clearError = useCallback(() => setError(null), [])

  return {
    save,
    isPending: isSaving || isRefreshing,
    savedAt,
    status,
    issues: status?.issues ?? [],
    error,
    clearError,
  }
}
