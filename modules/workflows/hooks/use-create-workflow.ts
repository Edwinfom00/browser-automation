"use client"

import { useCallback, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { workflowPath } from "@/modules/workflows/lib/paths"
import { createWorkflow } from "@/modules/workflows/server/actions"
import type {
  CreateWorkflowFieldErrors,
  CreateWorkflowInput,
  WorkflowSummary,
} from "@/modules/workflows/types"
import { createWorkflowSchema } from "@/modules/workflows/validators"

type UseCreateWorkflowOptions = {
  
  navigateOnCreate?: boolean
  onCreated?: (workflow: WorkflowSummary) => void
}


export function useCreateWorkflow({
  navigateOnCreate = true,
  onCreated,
}: UseCreateWorkflowOptions = {}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isNavigating, startNavigation] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<CreateWorkflowFieldErrors>({})

  const clearFieldError = useCallback((field: keyof CreateWorkflowInput) => {
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
    async (values: CreateWorkflowInput = {}) => {
      setError(null)

      const parsed = createWorkflowSchema.safeParse(values)

      if (!parsed.success) {
        const nextFieldErrors: CreateWorkflowFieldErrors = {}

        for (const issue of parsed.error.issues) {
          const field = issue.path[0] as keyof CreateWorkflowInput | undefined
          if (field && !nextFieldErrors[field]) {
            nextFieldErrors[field] = issue.message
          }
        }

        setFieldErrors(nextFieldErrors)
        return null
      }

      setFieldErrors({})
      setIsSubmitting(true)

      const result = await createWorkflow(parsed.data)

      if (result.error) {
        setIsSubmitting(false)

        if (result.error.code === "VALIDATION_ERROR") {
          setFieldErrors({ name: result.error.message })
          return null
        }

        setError(result.error.message)
        return null
      }

      const workflow = result.data
      onCreated?.(workflow)

      startNavigation(() => {
        if (navigateOnCreate) {
          router.push(workflowPath(workflow.id))
        }

        router.refresh()
      })

      setIsSubmitting(false)
      return workflow
    },
    [navigateOnCreate, onCreated, router]
  )

  const reset = useCallback(() => {
    setError(null)
    setFieldErrors({})
  }, [])

  return {
    submit,
    isPending: isSubmitting || isNavigating,
    error,
    fieldErrors,
    clearFieldError,
    reset,
  }
}
