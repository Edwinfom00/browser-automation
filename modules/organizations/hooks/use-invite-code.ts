"use client"

import { useCallback, useEffect, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import {
  generateInviteCodeAction,
  revokeInviteCodeAction,
} from "@/modules/organizations/server/invite-code-actions"
import type { AssignableOrganizationRole } from "@/modules/organizations/types"

type Task = "generate" | "revoke" | null


export function useInviteCode(code: string | null) {
  const router = useRouter()
  const [task, setTask] = useState<Task>(null)
  const [isRefreshing, startRefresh] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  const copyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (copyTimeout.current) {
        clearTimeout(copyTimeout.current)
      }
    },
    []
  )

  const generate = useCallback(
    async (role: AssignableOrganizationRole) => {
      setError(null)
      setTask("generate")

      const result = await generateInviteCodeAction({ role })

      setTask(null)

      if (result.error) {
        setError(result.error.message)
        return false
      }

      startRefresh(() => router.refresh())
      return true
    },
    [router]
  )

  const revoke = useCallback(async () => {
    setError(null)
    setTask("revoke")

    const result = await revokeInviteCodeAction()

    setTask(null)

    if (result.error) {
      setError(result.error.message)
      return false
    }

    startRefresh(() => router.refresh())
    return true
  }, [router])

  const copy = useCallback(async () => {
    if (!code) {
      return
    }

    try {
      await navigator.clipboard.writeText(code)
      setIsCopied(true)

      if (copyTimeout.current) {
        clearTimeout(copyTimeout.current)
      }

      copyTimeout.current = setTimeout(() => setIsCopied(false), 2000)
    } catch {
      setError("We couldn't copy the code. Select it and copy it manually.")
    }
  }, [code])

  const clearError = useCallback(() => setError(null), [])

  return {
    generate,
    revoke,
    copy,
    isCopied,
    task,
    isPending: task !== null || isRefreshing,
    error,
    clearError,
  }
}
