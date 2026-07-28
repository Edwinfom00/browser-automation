import { AuthBrand } from "@/modules/auth/ui/components/auth-brand"
import { AuthShowcase } from "@/modules/auth/ui/components/auth-showcase"
import { LoginForm } from "@/modules/auth/ui/components/login-form"

export function LoginView({ redirectTo }: { redirectTo?: string }) {
  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      <AuthShowcase className="hidden lg:flex" />

      <div className="flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-md">
          <AuthBrand />

          <div className="mt-12 space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="text-muted-foreground">
              Sign in to continue building workflows.
            </p>
          </div>

          <div className="mt-8">
            <LoginForm redirectTo={redirectTo} />
          </div>
        </div>
      </div>
    </main>
  )
}
