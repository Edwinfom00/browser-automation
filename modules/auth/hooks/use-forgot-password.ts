"use client"

import { useCallback, useState } from "react"

import { requestPasswordReset } from "@/lib/auth-client"
import { AUTH_ROUTES } from "@/modules/auth/constants"
import type {
  ForgotPasswordFieldErrors,
  ForgotPasswordInput,
} from "@/modules/auth/types"
import { forgotPasswordSchema } from "@/modules/auth/validators"

export function useForgotPassword() {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<ForgotPasswordFieldErrors>({})
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)
  const [isResending, setIsResending] = useState(false)
  const [resentAt, setResentAt] = useState<number | null>(null)

  const clearFieldError = useCallback((field: keyof ForgotPasswordInput) => {
    setFieldErrors((current) => {
      if (!current[field]) {
        return current
      }

      const next = { ...current }
      delete next[field]
      return next
    })
  }, [])

  const request = useCallback(async (email: string) => {
    // Absolute URL: Better Auth appends `?token=…` and mails the result, so it
    // can't be origin-relative.
    return requestPasswordReset({
      email,
      redirectTo: `${window.location.origin}${AUTH_ROUTES.resetPassword}`,
    })
  }, [])

  const submit = useCallback(
    async (values: ForgotPasswordInput) => {
      setError(null)

      const parsed = forgotPasswordSchema.safeParse(values)

      if (!parsed.success) {
        const nextFieldErrors: ForgotPasswordFieldErrors = {}

        for (const issue of parsed.error.issues) {
          const field = issue.path[0] as keyof ForgotPasswordInput | undefined
          if (field && !nextFieldErrors[field]) {
            nextFieldErrors[field] = issue.message
          }
        }

        setFieldErrors(nextFieldErrors)
        return false
      }

      setFieldErrors({})
      setIsPending(true)

      const result = await request(parsed.data.email)

      setIsPending(false)

      if (result.error) {
        setError(
          result.error.message ?? "We couldn't send the email. Try again."
        )
        return false
      }

      // Better Auth answers identically whether or not the account exists, so
      // the confirmation screen must not leak that either.
      setSubmittedEmail(parsed.data.email)
      return true
    },
    [request]
  )

  const resend = useCallback(async () => {
    if (!submittedEmail) {
      return false
    }

    setError(null)
    setIsResending(true)

    const result = await request(submittedEmail)

    setIsResending(false)

    if (result.error) {
      setError(
        result.error.message ?? "We couldn't resend the email. Try again."
      )
      return false
    }

    setResentAt(Date.now())
    return true
  }, [request, submittedEmail])

  return {
    submit,
    isPending,
    error,
    fieldErrors,
    clearFieldError,
    submittedEmail,
    resend,
    isResending,
    resentAt,
  }
}
