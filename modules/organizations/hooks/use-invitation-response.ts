"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"

import {
  DEFAULT_ORGANIZATION_REDIRECT,
  ORGANIZATION_ROUTES,
} from "@/modules/organizations/constants"
import {
  acceptInvitationAction,
  rejectInvitationAction,
} from "@/modules/organizations/server/actions"

type Decision = "accept" | "reject"


export function useInvitationResponse() {
  const router = useRouter()
 
  const [pending, setPending] = useState<{
    decision: Decision
    invitationId: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const respond = useCallback(
    async (decision: Decision, invitationId: string) => {
      setError(null)
      setPending({ decision, invitationId })

      const result =
        decision === "accept"
          ? await acceptInvitationAction({ invitationId })
          : await rejectInvitationAction({ invitationId })

      if (result.error) {
        setPending(null)
        setError(result.error.message)
        return false
      }

      router.push(
        decision === "accept"
          ? DEFAULT_ORGANIZATION_REDIRECT
          : ORGANIZATION_ROUTES.select
      )
      router.refresh()
      return true
    },
    [router]
  )

  const accept = useCallback(
    (invitationId: string) => respond("accept", invitationId),
    [respond]
  )

  const reject = useCallback(
    (invitationId: string) => respond("reject", invitationId),
    [respond]
  )

  const clearError = useCallback(() => setError(null), [])

  const pendingFor = useCallback(
    (invitationId: string): Decision | null =>
      pending?.invitationId === invitationId ? pending.decision : null,
    [pending]
  )

  return {
    accept,
    reject,
    pendingFor,
    isPending: pending !== null,
    error,
    clearError,
  }
}
