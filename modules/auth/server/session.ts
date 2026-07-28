import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { AUTH_ROUTES, DEFAULT_LOGIN_REDIRECT } from "@/modules/auth/constants"
import type { AuthSession } from "@/modules/auth/types"


export async function getSession(): Promise<AuthSession | null> {
  return auth.api.getSession({ headers: await headers() })
}


export async function requireSession(
  redirectTo: string = AUTH_ROUTES.login
): Promise<AuthSession> {
  const session = await getSession()

  if (!session) {
    redirect(redirectTo)
  }

  return session
}


export async function requireAnonymous(
  redirectTo: string = DEFAULT_LOGIN_REDIRECT
): Promise<void> {
  const session = await getSession()

  if (session) {
    redirect(redirectTo)
  }
}
