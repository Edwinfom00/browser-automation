import { Skeleton } from "@/components/ui/skeleton"

export function OrganizationSettingsSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading organization settings"
      className="flex max-w-2xl flex-col gap-8"
    >
      <div className="flex items-center gap-4">
        <Skeleton className="size-14 shrink-0 rounded-2xl" />

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Skeleton className="h-3 w-20" delay={60} />
          <Skeleton className="h-11 w-full rounded-lg" delay={60} />
        </div>
      </div>

      {[0, 1].map((index) => (
        <div key={index} className="flex flex-col gap-2">
          <Skeleton className="h-3 w-32" delay={120 + index * 80} />
          <Skeleton className="h-11 w-full rounded-lg" delay={120 + index * 80} />
        </div>
      ))}

      <Skeleton className="h-10 w-32 rounded-lg" delay={280} />

      <Skeleton className="h-40 w-full rounded-xl" delay={340} />
    </div>
  )
}
