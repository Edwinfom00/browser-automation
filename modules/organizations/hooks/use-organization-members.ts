"use client"

import { useCallback, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import {
  removeMemberAction,
  transferOwnershipAction,
  updateMemberRoleAction,
} from "@/modules/organizations/server/actions"
import type { AssignableOrganizationRole } from "@/modules/organizations/types"

/**
 * Every member mutation shares one pending slot keyed by member id, so a row
 * can show its own spinner while the rest of the table stays interactive.
 */
export function useOrganizationMembers() {
  const router = useRouter()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [isRefreshing, startRefresh] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(
    async (
      memberId: string,
      action: () => Promise<{ error: { message: string } | null }>
    ) => {
      setError(null)
      setPendingId(memberId)

      const result = await action()

      setPendingId(null)

      if (result.error) {
        setError(result.error.message)
        return false
      }

      startRefresh(() => router.refresh())
      return true
    },
    [router]
  )

  const changeRole = useCallback(
    (memberId: string, role: AssignableOrganizationRole) =>
      run(memberId, () => updateMemberRoleAction({ memberId, role })),
    [run]
  )

  const remove = useCallback(
    (memberId: string) => run(memberId, () => removeMemberAction({ memberId })),
    [run]
  )

  const transferOwnership = useCallback(
    (memberId: string) =>
      run(memberId, () => transferOwnershipAction({ memberId })),
    [run]
  )

  const clearError = useCallback(() => setError(null), [])

  return {
    changeRole,
    remove,
    transferOwnership,
    pendingId,
    isPending: pendingId !== null || isRefreshing,
    error,
    clearError,
  }
}
