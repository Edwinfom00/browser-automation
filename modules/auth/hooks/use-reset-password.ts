"use client"

import { useCallback, useState } from "react"

import { resetPassword } from "@/lib/auth-client"
import type {
  ResetPasswordFieldErrors,
  ResetPasswordInput,
} from "@/modules/auth/types"
import { resetPasswordSchema } from "@/modules/auth/validators"

type UseResetPasswordOptions = {
  token: string
}

export function useResetPassword({ token }: UseResetPasswordOptions) {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<ResetPasswordFieldErrors>({})
  const [isDone, setIsDone] = useState(false)

  const clearFieldError = useCallback((field: keyof ResetPasswordInput) => {
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
    async (values: ResetPasswordInput) => {
      setError(null)

      const parsed = resetPasswordSchema.safeParse(values)

      if (!parsed.success) {
        const nextFieldErrors: ResetPasswordFieldErrors = {}

        for (const issue of parsed.error.issues) {
          const field = issue.path[0] as keyof ResetPasswordInput | undefined
          if (field && !nextFieldErrors[field]) {
            nextFieldErrors[field] = issue.message
          }
        }

        setFieldErrors(nextFieldErrors)
        return false
      }

      setFieldErrors({})
      setIsPending(true)

      const result = await resetPassword({
        newPassword: parsed.data.password,
        token,
      })

      setIsPending(false)

      if (result.error) {
        setError(
          result.error.message ?? "We couldn't reset your password. Try again."
        )
        return false
      }

      // Sessions are revoked server-side, so send the user back through sign-in
      // rather than assuming they're now authenticated.
      setIsDone(true)
      return true
    },
    [token]
  )

  return { submit, isPending, error, fieldErrors, clearFieldError, isDone }
}
