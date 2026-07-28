"use client"

import { useCallback, useState } from "react"

import { sendVerificationEmail, signUp } from "@/lib/auth-client"
import { DEFAULT_LOGIN_REDIRECT } from "@/modules/auth/constants"
import type { SignUpFieldErrors, SignUpInput } from "@/modules/auth/types"
import { signUpSchema } from "@/modules/auth/validators"

type UseSignUpOptions = {
  redirectTo?: string
}

export function useSignUp({
  redirectTo = DEFAULT_LOGIN_REDIRECT,
}: UseSignUpOptions = {}) {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<SignUpFieldErrors>({})
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null)
  const [isResending, setIsResending] = useState(false)
  const [resentAt, setResentAt] = useState<number | null>(null)

  const clearFieldError = useCallback((field: keyof SignUpInput) => {
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
    async (values: SignUpInput) => {
      setError(null)

      const parsed = signUpSchema.safeParse(values)

      if (!parsed.success) {
        const nextFieldErrors: SignUpFieldErrors = {}

        for (const issue of parsed.error.issues) {
          const field = issue.path[0] as keyof SignUpInput | undefined
          if (field && !nextFieldErrors[field]) {
            nextFieldErrors[field] = issue.message
          }
        }

        setFieldErrors(nextFieldErrors)
        return false
      }

      setFieldErrors({})
      setIsPending(true)

      const result = await signUp.email({
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
        callbackURL: redirectTo,
      })

      setIsPending(false)

      if (result.error) {
        setError(
          result.error.message ?? "We couldn't create your account. Try again."
        )
        return false
      }

      setRegisteredEmail(parsed.data.email)
      return true
    },
    [redirectTo]
  )

  const resendVerification = useCallback(async () => {
    if (!registeredEmail) {
      return false
    }

    setError(null)
    setIsResending(true)

    const result = await sendVerificationEmail({
      email: registeredEmail,
      callbackURL: redirectTo,
    })

    setIsResending(false)

    if (result.error) {
      setError(
        result.error.message ?? "We couldn't resend the email. Try again."
      )
      return false
    }

    setResentAt(Date.now())
    return true
  }, [redirectTo, registeredEmail])

  return {
    submit,
    isPending,
    error,
    fieldErrors,
    clearFieldError,
    registeredEmail,
    resendVerification,
    isResending,
    resentAt,
  }
}
