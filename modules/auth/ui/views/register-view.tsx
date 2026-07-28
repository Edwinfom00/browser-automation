import Link from "next/link"

import { AUTH_ROUTES } from "@/modules/auth/constants"
import { AuthBrand } from "@/modules/auth/ui/components/auth-brand"
import { AuthSetupSteps } from "@/modules/auth/ui/components/auth-setup-steps"
import { RegisterForm } from "@/modules/auth/ui/components/register-form"

export function RegisterView({ redirectTo }: { redirectTo?: string }) {
  return (
    <main className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between gap-6 px-6 py-5 sm:px-10">
        <AuthBrand size="sm" />
        <p className="text-sm text-muted-foreground">
          <span className="hidden sm:inline">Already have an account? </span>
          <Link
            href={AUTH_ROUTES.login}
            className="font-medium text-blue-500 transition-colors hover:text-blue-400"
          >
            Sign in
          </Link>
        </p>
      </header>

      <div className="grid flex-1 border-t border-border lg:grid-cols-2">
        <section className="hidden items-start gap-8 px-10 py-16 lg:flex xl:px-16">
          <span
            aria-hidden
            className="[writing-mode:vertical-rl] rotate-180 text-[10px] tracking-[0.35em] text-muted-foreground uppercase"
          >
            Setup / 01
          </span>

          <div className="min-w-0">
            <h1 className="max-w-xs text-4xl font-semibold tracking-tight xl:text-5xl">
              Create your account
            </h1>
            <p className="mt-5 max-w-sm text-muted-foreground">
              Start with your work email. You&apos;ll name your workspace next.
            </p>

            <AuthSetupSteps activeStep={0} className="mt-12" />
          </div>
        </section>

        <section className="flex items-center justify-center border-border px-6 py-12 sm:px-12 lg:border-l">
          <div className="w-full max-w-md">
            <div className="mb-8 space-y-2 lg:hidden">
              <h1 className="text-3xl font-semibold tracking-tight">
                Create your account
              </h1>
              <p className="text-muted-foreground">
                Start with your work email. You&apos;ll name your workspace
                next.
              </p>
            </div>

            <RegisterForm redirectTo={redirectTo} />
          </div>
        </section>
      </div>
    </main>
  )
}
