import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function AuthFormSkeleton({
  fields = 2,
  meta = true,
  social = true,
  footer = true,
  className,
}: {
  fields?: number
  meta?: boolean
  social?: boolean
  footer?: boolean
  className?: string
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading form"
      className={cn("flex flex-col gap-5", className)}
    >
      {Array.from({ length: fields }, (_, index) => (
        <div key={index} className="flex flex-col gap-2">
          <Skeleton className="h-3.5 w-20" delay={index * 80} />
          <Skeleton className="h-12 w-full rounded-lg" delay={index * 80} />
        </div>
      ))}

      {meta ? (
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-3.5 w-32" delay={fields * 80} />
          <Skeleton className="h-3.5 w-28" delay={fields * 80} />
        </div>
      ) : null}

      <Skeleton className="h-12 w-full rounded-lg" delay={fields * 80 + 60} />

      {social ? (
        <>
          <div className="flex items-center gap-4 py-1">
            <span className="h-px flex-1 bg-border" />
            <Skeleton className="h-3 w-32" />
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-12 rounded-lg" delay={120} />
            <Skeleton className="h-12 rounded-lg" delay={200} />
          </div>
        </>
      ) : null}

      {footer ? (
        <Skeleton className="mx-auto mt-2 h-3.5 w-48" delay={240} />
      ) : null}
    </div>
  )
}
