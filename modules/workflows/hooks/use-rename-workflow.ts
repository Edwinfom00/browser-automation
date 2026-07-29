"use client"

import { useCallback, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { renameWorkflow } from "@/modules/workflows/server/actions"
import type {
  RenameWorkflowFieldErrors,
  RenameWorkflowInput,
  WorkflowSummary,
} from "@/modules/workflows/types"
import { renameWorkflowSchema } from "@/modules/workflows/validators"

type UseRenameWorkflowOptions = {
  onRenamed?: (workflow: WorkflowSummary) => void
}

export function useRenameWorkflow({
  onRenamed,
}: UseRenameWorkflowOptions = {}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRefreshing, startRefresh] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<RenameWorkflowFieldErrors>({})

  const clearFieldError = useCallback((field: keyof RenameWorkflowInput) => {
    setFieldErrors((current) => {
      if (!current[field]) {
        return current
      }

      const next = { ...current }
      delete next[field]
      return next
    })
  }, [])

  const submit = useCallback(
    async (values: RenameWorkflowInput) => {
      setError(null)

      const parsed = renameWorkflowSchema.safeParse(values)

      if (!parsed.success) {
        const nextFieldErrors: RenameWorkflowFieldErrors = {}

        for (const issue of parsed.error.issues) {
          const field = issue.path[0] as keyof RenameWorkflowInput | undefined
          if (field && !nextFieldErrors[field]) {
            nextFieldErrors[field] = issue.message
          }
        }

        setFieldErrors(nextFieldErrors)
        return null
      }

      setFieldErrors({})
      setIsSubmitting(true)

      const result = await renameWorkflow(parsed.data)

      if (result.error) {
        setIsSubmitting(false)

        if (result.error.code === "VALIDATION_ERROR") {
          setFieldErrors({ name: result.error.message })
          return null
        }

        setError(result.error.message)
        return null
      }

      onRenamed?.(result.data)
      startRefresh(() => router.refresh())
      setIsSubmitting(false)

      return result.data
    },
    [onRenamed, router]
  )

  const reset = useCallback(() => {
    setError(null)
    setFieldErrors({})
  }, [])

  return {
    submit,
    isPending: isSubmitting || isRefreshing,
    error,
    fieldErrors,
    clearFieldError,
    reset,
  }
}
