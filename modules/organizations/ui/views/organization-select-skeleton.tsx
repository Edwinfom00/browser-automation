import { LuPlus } from "react-icons/lu"

import { Skeleton } from "@/components/ui/skeleton"
import { AuthBrand } from "@/modules/auth/ui/components/auth-brand"
import { AuthFormSkeleton } from "@/modules/auth/ui/components/auth-form-skeleton"
import { OrganizationListSkeleton } from "@/modules/organizations/ui/components/organization-list-skeleton"

export function OrganizationSelectSkeleton() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="flex items-center justify-between gap-4 border-b border-border px-6 py-3.5 sm:px-8">
        <AuthBrand size="sm" />

        <div className="flex items-center gap-2.5">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="hidden h-3.5 w-24 sm:block" delay={80} />
        </div>
      </header>

      <main className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)]">
        <section className="px-6 py-12 sm:px-12 lg:py-20">
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-10 motion-safe:animate-rise">
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Choose an organization
              </h1>
              <p className="text-muted-foreground">
                Select where you want to continue.
              </p>
            </div>

            <OrganizationListSkeleton />
          </div>
        </section>

        <section className="border-t border-border px-6 py-12 sm:px-12 lg:border-t-0 lg:border-l lg:py-20">
          <div className="mx-auto flex w-full max-w-md flex-col gap-8">
            <div className="flex items-start gap-4">
              <span
                aria-hidden
                className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-600 text-white [&_svg]:size-5.5"
              >
                <LuPlus />
              </span>

              <div className="space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Create organization
                </h2>
                <p className="text-sm text-muted-foreground">
                  Start a new shared workspace.
                </p>
              </div>
            </div>

            <AuthFormSkeleton
              fields={2}
              meta={false}
              social={false}
              footer={false}
            />
          </div>
        </section>
      </main>
    </div>
  )
}
