"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"

import { organization } from "@/lib/auth-client"
import { DEFAULT_ORGANIZATION_REDIRECT } from "@/modules/organizations/constants"

type UseSelectOrganizationOptions = {
  redirectTo?: string
}

export function useSelectOrganization({
  redirectTo = DEFAULT_ORGANIZATION_REDIRECT,
}: UseSelectOrganizationOptions = {}) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = useCallback(
    async (organizationId: string) => {
      if (!organizationId) {
        setError("Pick an organization to continue.")
        return false
      }

      setError(null)
      setIsPending(true)

      const result = await organization.setActive({ organizationId })

      if (result.error) {
        setIsPending(false)
        setError(
          result.error.message ??
            "We couldn't open that organization. Try again."
        )
        return false
      }

      router.push(redirectTo)
      router.refresh()
      return true
    },
    [redirectTo, router]
  )

  return { submit, isPending, error }
}
