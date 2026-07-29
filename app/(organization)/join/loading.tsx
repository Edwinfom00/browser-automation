import { Skeleton } from "@/components/ui/skeleton"
import { AuthBrand } from "@/modules/auth/ui/components/auth-brand"
import { INVITE_CODE_LENGTH } from "@/modules/organizations/constants"

export default function Loading() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="flex items-center justify-between gap-4 border-b border-border px-6 py-3.5 sm:px-8">
        <AuthBrand size="sm" />

        <div className="flex items-center gap-2.5">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="hidden h-3.5 w-24 sm:block" delay={80} />
        </div>
      </header>

      <main
        role="status"
        aria-live="polite"
        aria-label="Loading the join form"
        className="flex flex-1 items-center justify-center px-6 py-12 sm:px-12"
      >
        <div className="flex w-full max-w-md flex-col items-center gap-8">
          <Skeleton className="size-14 rounded-2xl" />

          <div className="flex w-full flex-col items-center gap-3">
            <Skeleton className="h-8 w-56 max-w-full" delay={60} />
            <Skeleton className="h-4 w-72 max-w-full" delay={120} />
          </div>

          <div className="flex items-center gap-2.5">
            {Array.from({ length: INVITE_CODE_LENGTH }, (_, index) => (
              <Skeleton
                key={index}
                className="size-13 rounded-xl sm:size-14"
                delay={160 + index * 40}
              />
            ))}
          </div>

          <Skeleton className="h-12 w-full rounded-lg" delay={420} />
        </div>
      </main>
    </div>
  )
}
