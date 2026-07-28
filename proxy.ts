import { NextResponse, type NextRequest } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

import { AUTH_ROUTES, DEFAULT_LOGIN_REDIRECT } from "@/modules/auth/constants"

/**
 * Routes reachable without a session. Everything else in the app is private.
 */
const PUBLIC_ROUTES: readonly string[] = Object.values(AUTH_ROUTES)

/**
 * Public routes an authenticated user should still be bounced away from.
 * `reset-password` is left out on purpose: it is opened from an emailed token
 * link and must keep working even while a session is active.
 */
const ANONYMOUS_ONLY_ROUTES: readonly string[] = [
  AUTH_ROUTES.login,
  AUTH_ROUTES.register,
  AUTH_ROUTES.forgotPassword,
]

function matchesRoute(pathname: string, routes: readonly string[]): boolean {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
}

export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  // Optimistic check only — it reads the session cookie without hitting the
  // database. Pages and server actions still verify the session for real.
  const isAuthenticated = getSessionCookie(request) !== null

  if (!isAuthenticated && !matchesRoute(pathname, PUBLIC_ROUTES)) {
    const url = request.nextUrl.clone()
    url.pathname = AUTH_ROUTES.login
    url.search = ""
    url.searchParams.set("redirectTo", `${pathname}${search}`)

    return NextResponse.redirect(url)
  }

  if (isAuthenticated && matchesRoute(pathname, ANONYMOUS_ONLY_ROUTES)) {
    const url = request.nextUrl.clone()
    url.pathname = DEFAULT_LOGIN_REDIRECT
    url.search = ""

    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /**
     * Run on every request except:
     * - `/api/auth/*`  Better Auth handlers (sign-in, callbacks, verification)
     * - `_next/*`      framework assets
     * - static files    anything with a file extension, plus the public folder
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.[\\w]+$).*)",
  ],
}
