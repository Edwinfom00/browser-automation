import { Skeleton } from "@/components/ui/skeleton"

function RowSkeleton({ delay }: { delay: number }) {
  return (
    <div className="flex items-center gap-4 border-b border-border px-4 py-3.5 last:border-b-0">
      <Skeleton className="size-9 shrink-0 rounded-full" delay={delay} />

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Skeleton className="h-3.5 w-40 max-w-full" delay={delay} />
        <Skeleton className="h-3 w-52 max-w-full" delay={delay + 60} />
      </div>

      <Skeleton className="h-6 w-20 shrink-0 rounded-4xl" delay={delay + 60} />
    </div>
  )
}

export function OrganizationMembersSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading members"
      className="flex flex-col gap-10"
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-72 max-w-full" delay={60} />
          </div>

          <Skeleton className="h-9 w-32 shrink-0 rounded-lg" delay={60} />
        </div>

        <div className="rounded-xl border border-border">
          {Array.from({ length: count }, (_, index) => (
            <RowSkeleton key={index} delay={index * 90} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-48" delay={count * 90} />
          <Skeleton className="h-3 w-64 max-w-full" delay={count * 90 + 60} />
        </div>

        <Skeleton className="h-32 w-full rounded-xl" delay={count * 90 + 120} />
      </div>
    </div>
  )
}
