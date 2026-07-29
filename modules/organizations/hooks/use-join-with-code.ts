"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"

import { DEFAULT_ORGANIZATION_REDIRECT } from "@/modules/organizations/constants"
import { isCompleteInviteCode } from "@/modules/organizations/lib/invite-code"
import { joinWithInviteCodeAction } from "@/modules/organizations/server/invite-code-actions"

export function useJoinWithCode({
  redirectTo = DEFAULT_ORGANIZATION_REDIRECT,
}: { redirectTo?: string } = {}) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = useCallback(
    async (code: string) => {
      if (!isCompleteInviteCode(code)) {
        setError("Enter all six digits.")
        return false
      }

      setError(null)
      setIsPending(true)

      const result = await joinWithInviteCodeAction({ code })

      if (result.error) {
        setIsPending(false)
        setError(result.error.message)
        return false
      }

      router.push(redirectTo)
      router.refresh()
      return true
    },
    [redirectTo, router]
  )

  const clearError = useCallback(() => setError(null), [])

  return { submit, isPending, error, clearError }
}
