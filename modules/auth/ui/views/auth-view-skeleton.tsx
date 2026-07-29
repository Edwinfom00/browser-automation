import { Skeleton } from "@/components/ui/skeleton"
import { AuthBrand } from "@/modules/auth/ui/components/auth-brand"
import { AuthFormSkeleton } from "@/modules/auth/ui/components/auth-form-skeleton"
import { AuthShowcase } from "@/modules/auth/ui/components/auth-showcase"

export function AuthViewSkeleton({
  fields = 2,
  social = true,
}: {
  fields?: number
  social?: boolean
}) {
  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      <AuthShowcase className="hidden lg:flex" />

      <div className="flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-md motion-safe:animate-rise">
          <AuthBrand />

          <div className="mt-12 space-y-3">
            <Skeleton className="h-8 w-56 rounded-lg" />
            <Skeleton className="h-4 w-72 max-w-full" delay={80} />
          </div>

          <AuthFormSkeleton fields={fields} social={social} className="mt-8" />
        </div>
      </div>
    </main>
  )
}
