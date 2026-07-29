import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function OrganizationOptionSkeleton({
  delay = 0,
  className,
}: {
  delay?: number
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-xl border border-border px-4 py-3.5",
        className
      )}
    >
      <Skeleton className="size-10 shrink-0 rounded-lg" delay={delay} />

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Skeleton className="h-3.5 w-40 max-w-full" delay={delay} />
        <Skeleton className="h-3 w-28 max-w-full" delay={delay + 60} />
      </div>

      <Skeleton
        className="hidden h-3 w-20 shrink-0 sm:block"
        delay={delay + 60}
      />

      <span
        aria-hidden
        className="size-5 shrink-0 rounded-full border-2 border-border"
      />
    </div>
  )
}

export function OrganizationListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading organizations"
      className="flex flex-col gap-8"
    >
      <div className="flex flex-col gap-3">
        <Skeleton className="h-3 w-48" />

        <div className="flex flex-col gap-3">
          {Array.from({ length: count }, (_, index) => (
            <OrganizationOptionSkeleton key={index} delay={index * 90} />
          ))}
        </div>
      </div>

      <Skeleton className="h-12 w-full rounded-lg" delay={count * 90} />
    </div>
  )
}
