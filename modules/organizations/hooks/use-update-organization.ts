"use client"

import { useCallback, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { organization } from "@/lib/auth-client"
import { updateOrganizationAction } from "@/modules/organizations/server/actions"
import type {
  UpdateOrganizationFieldErrors,
  UpdateOrganizationInput,
} from "@/modules/organizations/types"
import { updateOrganizationSchema } from "@/modules/organizations/validators"

const SLUG_TAKEN_MESSAGE = "That slug is already taken. Try another one."

export function useUpdateOrganization(currentSlug: string) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [isRefreshing, startRefresh] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<UpdateOrganizationFieldErrors>(
    {}
  )
  const [savedAt, setSavedAt] = useState<number | null>(null)

  const clearFieldError = useCallback(
    (field: keyof UpdateOrganizationInput) => {
      setSavedAt(null)
      setFieldErrors((current) => {
        if (!current[field]) {
          return current
        }

        const next = { ...current }
        delete next[field]
        return next
      })
    },
    []
  )

  /** The org keeps its own slug, so only a *different* taken slug is a clash. */
  const checkSlugAvailability = useCallback(
    async (slug: string) => {
      if (slug === currentSlug) {
        return true
      }

      const parsed = updateOrganizationSchema.shape.slug.safeParse(slug)

      if (!parsed.success) {
        return false
      }

      const result = await organization.checkSlug({ slug: parsed.data })

      if (result.error) {
        setFieldErrors((current) => ({ ...current, slug: SLUG_TAKEN_MESSAGE }))
        return false
      }

      return true
    },
    [currentSlug]
  )

  const submit = useCallback(
    async (values: UpdateOrganizationInput) => {
      setError(null)
      setSavedAt(null)

      const parsed = updateOrganizationSchema.safeParse(values)

      if (!parsed.success) {
        const nextFieldErrors: UpdateOrganizationFieldErrors = {}

        for (const issue of parsed.error.issues) {
          const field = issue.path[0] as
            | keyof UpdateOrganizationInput
            | undefined

          if (field && !nextFieldErrors[field]) {
            nextFieldErrors[field] = issue.message
          }
        }

        setFieldErrors(nextFieldErrors)
        return false
      }

      setFieldErrors({})
      setIsSaving(true)

      const result = await updateOrganizationAction(parsed.data)

      setIsSaving(false)

      if (result.error) {
        if (result.error.field === "slug") {
          setFieldErrors({ slug: result.error.message })
          return false
        }

        setError(result.error.message)
        return false
      }

      setSavedAt(Date.now())
      startRefresh(() => router.refresh())
      return true
    },
    [router]
  )

  return {
    submit,
    checkSlugAvailability,
    clearFieldError,
    isPending: isSaving || isRefreshing,
    error,
    fieldErrors,
    savedAt,
  }
}
