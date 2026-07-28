"use client"

import { useCallback, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { organization } from "@/lib/auth-client"

type UseSwitchOrganizationOptions = {
  /** Where to land after switching. Defaults to refreshing the current route. */
  redirectTo?: string
}

/**
 * Switches the session's active organization from inside the app shell. Unlike
 * {@link useSelectOrganization} — which is the onboarding gate — this keeps the
 * user where they are and only re-renders the server components underneath.
 */
export function useSwitchOrganization({
  redirectTo,
}: UseSwitchOrganizationOptions = {}) {
  const router = useRouter()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [isRefreshing, startRefresh] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const switchTo = useCallback(
    async (organizationId: string) => {
      if (!organizationId) {
        return false
      }

      setError(null)
      setPendingId(organizationId)

      const result = await organization.setActive({ organizationId })

      if (result.error) {
        setPendingId(null)
        setError(
          result.error.message ??
            "We couldn't switch organization. Try again."
        )
        return false
      }

      startRefresh(() => {
        if (redirectTo) {
          router.push(redirectTo)
        }

        router.refresh()
      })

      setPendingId(null)
      return true
    },
    [redirectTo, router]
  )

  const clearError = useCallback(() => setError(null), [])

  return {
    switchTo,
    pendingId,
    isPending: pendingId !== null || isRefreshing,
    error,
    clearError,
  }
}
