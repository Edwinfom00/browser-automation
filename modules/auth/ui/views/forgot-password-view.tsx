import { AuthBrand } from "@/modules/auth/ui/components/auth-brand"
import { AuthShowcase } from "@/modules/auth/ui/components/auth-showcase"
import { ForgotPasswordForm } from "@/modules/auth/ui/components/forgot-password-form"

export function ForgotPasswordView() {
  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      <AuthShowcase className="hidden lg:flex" />

      <div className="flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-md">
          <AuthBrand />

          <div className="mt-12 space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              Forgot your password?
            </h1>
            <p className="text-muted-foreground">
              Enter the email on your account and we&apos;ll send you a link to
              set a new password.
            </p>
          </div>

          <div className="mt-8">
            <ForgotPasswordForm />
          </div>
        </div>
      </div>
    </main>
  )
}
