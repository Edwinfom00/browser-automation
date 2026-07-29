import { Loader } from "@/components/shared/loading"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const GHOST_NODES = [
  { width: "w-[19rem]", offset: "ml-0" },
  { width: "w-[19rem]", offset: "ml-12" },
  { width: "w-[19rem]", offset: "ml-24" },
] as const

function GhostNode({
  className,
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      className={cn(
        "max-w-full rounded-xl border border-border bg-card p-3 shadow-sm shadow-foreground/[0.04] motion-safe:animate-rise",
        className
      )}
      style={style}
    >
      <div className="flex items-center gap-3">
        <Skeleton className="size-7 rounded-lg" />
        <Skeleton className="h-3.5 w-24" />
      </div>

      <div className="mt-3 flex items-center justify-between gap-4 border-t border-border pt-3">
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  )
}

export function WorkflowViewSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading workflow"
      className="flex flex-1 flex-col gap-6"
    >
      <header className="flex flex-col gap-2">
        <Skeleton className="h-7 w-56 rounded-lg" />
        <Skeleton className="h-4 w-44" />
      </header>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border">
        <div aria-hidden className="flex flex-col px-6 py-10">
          {GHOST_NODES.map((node, index) => (
            <div key={index} className="flex flex-col">
              {index > 0 ? (
                <div className="ml-6 h-8 w-12 rounded-bl-lg border-b border-l border-border" />
              ) : null}

              <GhostNode
                className={cn(node.width, node.offset)}
                style={{ animationDelay: `${index * 90}ms` }}
              />
            </div>
          ))}
        </div>

        <div className="absolute bottom-5 flex items-center gap-2.5 rounded-full border border-border bg-background/80 px-3.5 py-1.5 shadow-sm backdrop-blur-sm">
          <Loader size="xs" />
          <span className="text-xs font-medium text-muted-foreground">
            Loading workflow…
          </span>
        </div>
      </div>
    </div>
  )
}
