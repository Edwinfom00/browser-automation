"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"

import { ORGANIZATION_ROUTES } from "@/modules/organizations/constants"
import {
  deleteOrganizationAction,
  leaveOrganizationAction,
} from "@/modules/organizations/server/actions"


export function useLeaveOrganization() {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(
    async (action: () => Promise<{ error: { message: string } | null }>) => {
      setError(null)
      setIsPending(true)

      const result = await action()

      if (result.error) {
        setIsPending(false)
        setError(result.error.message)
        return false
      }

      router.push(ORGANIZATION_ROUTES.select)
      router.refresh()
      return true
    },
    [router]
  )

  const leave = useCallback(() => run(leaveOrganizationAction), [run])

  const remove = useCallback(() => run(deleteOrganizationAction), [run])

  const clearError = useCallback(() => setError(null), [])

  return { leave, remove, isPending, error, clearError }
}
