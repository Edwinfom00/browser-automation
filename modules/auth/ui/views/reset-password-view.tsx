import Link from "next/link"
import { LuLink2Off } from "react-icons/lu"

import { Button } from "@/components/ui/button"
import { AUTH_ROUTES } from "@/modules/auth/constants"
import { AuthBrand } from "@/modules/auth/ui/components/auth-brand"
import { AuthShowcase } from "@/modules/auth/ui/components/auth-showcase"
import { ResetPasswordForm } from "@/modules/auth/ui/components/reset-password-form"

/**
 * Better Auth sends the user here as `?token=…`, or as `?error=INVALID_TOKEN`
 * when the link has already been used or has expired.
 */
export function ResetPasswordView({
  token,
  error,
}: {
  token?: string
  error?: string
}) {
  const isTokenUsable = Boolean(token) && !error

  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      <AuthShowcase className="hidden lg:flex" />

      <div className="flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-md">
          <AuthBrand />

          {isTokenUsable ? (
            <>
              <div className="mt-12 space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight">
                  Set a new password
                </h1>
                <p className="text-muted-foreground">
                  Choose a password you haven&apos;t used before on this
                  account.
                </p>
              </div>

              <div className="mt-8">
                <ResetPasswordForm token={token as string} />
              </div>
            </>
          ) : (
            <div className="mt-12 flex flex-col gap-5">
              <span
                aria-hidden
                className="grid size-12 place-items-center rounded-xl bg-destructive/10 text-destructive [&_svg]:size-6"
              >
                <LuLink2Off />
              </span>

              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight">
                  This link has expired
                </h1>
                <p className="text-muted-foreground">
                  Reset links work once and last an hour. Request a fresh one to
                  keep going.
                </p>
              </div>

              <Button
                asChild
                className="h-12 w-full rounded-lg bg-blue-600 text-base font-semibold text-white hover:bg-blue-500"
              >
                <Link href={AUTH_ROUTES.forgotPassword}>
                  Request a new link
                </Link>
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Remembered it?{" "}
                <Link
                  href={AUTH_ROUTES.login}
                  className="font-medium text-blue-500 transition-colors hover:text-blue-400"
                >
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
