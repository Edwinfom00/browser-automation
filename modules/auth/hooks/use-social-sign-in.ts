"use client"

import { useCallback, useState } from "react"

import { signIn } from "@/lib/auth-client"
import { DEFAULT_LOGIN_REDIRECT } from "@/modules/auth/constants"
import type { SocialProvider } from "@/modules/auth/types"

type UseSocialSignInOptions = {
  callbackURL?: string
}

export function useSocialSignIn({
  callbackURL = DEFAULT_LOGIN_REDIRECT,
}: UseSocialSignInOptions = {}) {
  const [pendingProvider, setPendingProvider] = useState<SocialProvider | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)

  const signInWith = useCallback(
    async (provider: SocialProvider) => {
      setError(null)
      setPendingProvider(provider)

      const result = await signIn.social({ provider, callbackURL })
      if (result.error) {
        setPendingProvider(null)
        setError(
          result.error.message ?? `We couldn't reach ${provider}. Try again.`
        )
      }
    },
    [callbackURL]
  )

  return { signInWith, pendingProvider, error }
}
