"use client"

import { useMemo, useState } from "react"
import { useParams } from "next/navigation"

import type { WorkflowSummary } from "@/modules/workflows/types"


export function useActiveWorkflowId(): string | null {
  const params = useParams<{ workflowId?: string }>()

  return params?.workflowId ?? null
}


export function useWorkflowList(workflows: WorkflowSummary[]) {
  const activeWorkflowId = useActiveWorkflowId()
  const [query, setQuery] = useState("")

  const visibleWorkflows = useMemo(() => {
    const needle = query.trim().toLowerCase()

    if (!needle) {
      return workflows
    }

    return workflows.filter((workflow) =>
      workflow.name.toLowerCase().includes(needle)
    )
  }, [query, workflows])

  const activeWorkflow = useMemo(
    () =>
      workflows.find((workflow) => workflow.id === activeWorkflowId) ?? null,
    [activeWorkflowId, workflows]
  )

  return {
    workflows: visibleWorkflows,
    activeWorkflow,
    activeWorkflowId,
    query,
    setQuery,
    isEmpty: workflows.length === 0,
    hasNoMatches: workflows.length > 0 && visibleWorkflows.length === 0,
  }
}
