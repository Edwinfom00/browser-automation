"use client"

import { useCallback, useState, useTransition } from "react"
import { useParams, useRouter } from "next/navigation"

import { DEFAULT_WORKFLOW_REDIRECT } from "@/modules/workflows/constants"
import { deleteWorkflow } from "@/modules/workflows/server/actions"

type UseDeleteWorkflowOptions = {
  redirectTo?: string
  onDeleted?: (workflowId: string) => void
}


export function useDeleteWorkflow({
  redirectTo = DEFAULT_WORKFLOW_REDIRECT,
  onDeleted,
}: UseDeleteWorkflowOptions = {}) {
  const router = useRouter()
  const params = useParams<{ workflowId?: string }>()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [isRefreshing, startRefresh] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const remove = useCallback(
    async (workflowId: string) => {
      if (!workflowId) {
        return false
      }

      setError(null)
      setPendingId(workflowId)

      const result = await deleteWorkflow({ workflowId })

      if (result.error) {
        setPendingId(null)
        setError(result.error.message)
        return false
      }

      const wasOpen = params?.workflowId === workflowId
      onDeleted?.(workflowId)

      startRefresh(() => {
        if (wasOpen) {
          router.push(redirectTo)
        }

        router.refresh()
      })

      setPendingId(null)
      return true
    },
    [onDeleted, params?.workflowId, redirectTo, router]
  )

  const clearError = useCallback(() => setError(null), [])

  return {
    remove,
    pendingId,
    isPending: pendingId !== null || isRefreshing,
    error,
    clearError,
  }
}
