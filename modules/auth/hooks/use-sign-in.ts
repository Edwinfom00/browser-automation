"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"

import { signIn } from "@/lib/auth-client"
import { DEFAULT_LOGIN_REDIRECT } from "@/modules/auth/constants"
import type { SignInFieldErrors, SignInInput } from "@/modules/auth/types"
import { signInSchema } from "@/modules/auth/validators"

type UseSignInOptions = {
  redirectTo?: string
}

export function useSignIn({
  redirectTo = DEFAULT_LOGIN_REDIRECT,
}: UseSignInOptions = {}) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<SignInFieldErrors>({})

  const clearFieldError = useCallback((field: keyof SignInInput) => {
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
    async (values: SignInInput) => {
      setError(null)

      const parsed = signInSchema.safeParse(values)

      if (!parsed.success) {
        const nextFieldErrors: SignInFieldErrors = {}

        for (const issue of parsed.error.issues) {
          const field = issue.path[0] as keyof SignInInput | undefined
          if (field && !nextFieldErrors[field]) {
            nextFieldErrors[field] = issue.message
          }
        }

        setFieldErrors(nextFieldErrors)
        return false
      }

      setFieldErrors({})
      setIsPending(true)

      const result = await signIn.email({
        email: parsed.data.email,
        password: parsed.data.password,
        rememberMe: parsed.data.rememberMe,
      })

      if (result.error) {
        setIsPending(false)
        setError(result.error.message ?? "We couldn't sign you in. Try again.")
        return false
      }

      router.push(redirectTo)
      router.refresh()
      return true
    },
    [redirectTo, router]
  )

  return { submit, isPending, error, fieldErrors, clearFieldError }
}
