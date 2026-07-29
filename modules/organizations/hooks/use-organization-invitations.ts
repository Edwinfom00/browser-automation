"use client"

import { useCallback, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import {
  cancelInvitationAction,
  inviteMemberAction,
  resendInvitationAction,
} from "@/modules/organizations/server/actions"
import type {
  InviteMemberFieldErrors,
  InviteMemberInput,
} from "@/modules/organizations/types"
import { inviteMemberSchema } from "@/modules/organizations/validators"

export function useInviteMember({ onInvited }: { onInvited?: () => void } = {}) {
  const router = useRouter()
  const [isSending, setIsSending] = useState(false)
  const [isRefreshing, startRefresh] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<InviteMemberFieldErrors>({})

  const clearFieldError = useCallback((field: keyof InviteMemberInput) => {
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
    async (values: InviteMemberInput) => {
      setError(null)

      const parsed = inviteMemberSchema.safeParse(values)

      if (!parsed.success) {
        const nextFieldErrors: InviteMemberFieldErrors = {}

        for (const issue of parsed.error.issues) {
          const field = issue.path[0] as keyof InviteMemberInput | undefined

          if (field && !nextFieldErrors[field]) {
            nextFieldErrors[field] = issue.message
          }
        }

        setFieldErrors(nextFieldErrors)
        return false
      }

      setFieldErrors({})
      setIsSending(true)

      const result = await inviteMemberAction(parsed.data)

      setIsSending(false)

      if (result.error) {
        if (result.error.field === "email") {
          setFieldErrors({ email: result.error.message })
          return false
        }

        setError(result.error.message)
        return false
      }

      onInvited?.()
      startRefresh(() => router.refresh())
      return true
    },
    [onInvited, router]
  )

  const reset = useCallback(() => {
    setError(null)
    setFieldErrors({})
  }, [])

  return {
    submit,
    reset,
    clearFieldError,
    isPending: isSending || isRefreshing,
    error,
    fieldErrors,
  }
}

/** Cancel and resend, keyed by invitation id so rows spin independently. */
export function useInvitationActions() {
  const router = useRouter()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [isRefreshing, startRefresh] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(
    async (
      invitationId: string,
      action: () => Promise<{ error: { message: string } | null }>
    ) => {
      setError(null)
      setPendingId(invitationId)

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

  const cancel = useCallback(
    (invitationId: string) =>
      run(invitationId, () => cancelInvitationAction({ invitationId })),
    [run]
  )

  const resend = useCallback(
    (invitation: { id: string; email: string; role: InviteMemberInput["role"] }) =>
      run(invitation.id, () =>
        resendInvitationAction({
          email: invitation.email,
          role: invitation.role,
        })
      ),
    [run]
  )

  const clearError = useCallback(() => setError(null), [])

  return {
    cancel,
    resend,
    pendingId,
    isPending: pendingId !== null || isRefreshing,
    error,
    clearError,
  }
}
