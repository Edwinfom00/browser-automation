"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"

import { organization } from "@/lib/auth-client"
import { DEFAULT_ORGANIZATION_REDIRECT } from "@/modules/organizations/constants"
import type {
  CreateOrganizationFieldErrors,
  CreateOrganizationInput,
} from "@/modules/organizations/types"
import { createOrganizationSchema } from "@/modules/organizations/validators"

type UseCreateOrganizationOptions = {
  redirectTo?: string
}

const SLUG_TAKEN_MESSAGE = "That slug is already taken. Try another one."

export function useCreateOrganization({
  redirectTo = DEFAULT_ORGANIZATION_REDIRECT,
}: UseCreateOrganizationOptions = {}) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<CreateOrganizationFieldErrors>(
    {}
  )

  const clearFieldError = useCallback(
    (field: keyof CreateOrganizationInput) => {
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

  /**
   * Better Auth answers `/organization/check-slug` with an error when the slug
   * is taken, so a failed call is the signal — not an exception.
   */
  const checkSlugAvailability = useCallback(async (slug: string) => {
    const parsed = createOrganizationSchema.shape.slug.safeParse(slug)

    if (!parsed.success) {
      return false
    }

    const result = await organization.checkSlug({ slug: parsed.data })

    if (result.error) {
      setFieldErrors((current) => ({ ...current, slug: SLUG_TAKEN_MESSAGE }))
      return false
    }

    return true
  }, [])

  const submit = useCallback(
    async (values: CreateOrganizationInput) => {
      setError(null)

      const parsed = createOrganizationSchema.safeParse(values)

      if (!parsed.success) {
        const nextFieldErrors: CreateOrganizationFieldErrors = {}

        for (const issue of parsed.error.issues) {
          const field = issue.path[0] as
            keyof CreateOrganizationInput | undefined
          if (field && !nextFieldErrors[field]) {
            nextFieldErrors[field] = issue.message
          }
        }

        setFieldErrors(nextFieldErrors)
        return false
      }

      setFieldErrors({})
      setIsPending(true)

      const result = await organization.create({
        name: parsed.data.name,
        slug: parsed.data.slug,
      })

      if (result.error) {
        setIsPending(false)

        if (
          result.error.code === "ORGANIZATION_SLUG_ALREADY_TAKEN" ||
          result.error.code === "ORGANIZATION_ALREADY_EXISTS"
        ) {
          setFieldErrors({ slug: SLUG_TAKEN_MESSAGE })
          return false
        }

        setError(
          result.error.message ??
            "We couldn't create that organization. Try again."
        )
        return false
      }

      // Better Auth makes a freshly created organization the active one.
      router.push(redirectTo)
      router.refresh()
      return true
    },
    [redirectTo, router]
  )

  return {
    submit,
    isPending,
    error,
    fieldErrors,
    clearFieldError,
    checkSlugAvailability,
  }
}
