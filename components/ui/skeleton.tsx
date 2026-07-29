import { cn } from "@/lib/utils"

type SkeletonAnimation = "shimmer" | "pulse" | "none"

const animationStyles: Record<SkeletonAnimation, string> = {
  shimmer:
    "before:absolute before:inset-0 before:-translate-x-full before:bg-linear-to-r before:from-transparent before:via-foreground/[0.07] before:to-transparent motion-safe:before:animate-shimmer dark:before:via-foreground/[0.12]",
  pulse: "motion-safe:animate-skeleton-pulse",
  none: "",
}

function Skeleton({
  className,
  animation = "shimmer",
  delay,
  style,
  ...props
}: React.ComponentProps<"div"> & {
  animation?: SkeletonAnimation
  delay?: number
}) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden
      className={cn(
        "relative overflow-hidden rounded-md bg-muted",
        animationStyles[animation],
        className
      )}
      style={
        delay
          ? ({
              "--skeleton-delay": `${delay}ms`,
              ...style,
            } as React.CSSProperties)
          : style
      }
      {...props}
    />
  )
}

function SkeletonText({
  lines = 3,
  className,
  lineClassName,
  ...props
}: React.ComponentProps<"div"> & {
  lines?: number
  lineClassName?: string
}) {
  const widths = ["w-full", "w-[92%]", "w-[84%]", "w-[96%]"]

  return (
    <div
      data-slot="skeleton-text"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    >
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          className={cn(
            "h-3.5",
            index === lines - 1 ? "w-3/5" : widths[index % widths.length],
            lineClassName
          )}
        />
      ))}
    </div>
  )
}

function SkeletonCircle({
  className,
  ...props
}: React.ComponentProps<typeof Skeleton>) {
  return (
    <Skeleton className={cn("size-10 rounded-full", className)} {...props} />
  )
}

function SkeletonButton({
  className,
  ...props
}: React.ComponentProps<typeof Skeleton>) {
  return (
    <Skeleton className={cn("h-9 w-28 rounded-lg", className)} {...props} />
  )
}

function SkeletonField({
  className,
  labelClassName,
  controlClassName,
  ...props
}: React.ComponentProps<"div"> & {
  labelClassName?: string
  controlClassName?: string
}) {
  return (
    <div
      data-slot="skeleton-field"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    >
      <Skeleton className={cn("h-3.5 w-24", labelClassName)} />
      <Skeleton className={cn("h-9 w-full rounded-lg", controlClassName)} />
    </div>
  )
}

export {
  Skeleton,
  SkeletonButton,
  SkeletonCircle,
  SkeletonField,
  SkeletonText,
  type SkeletonAnimation,
}
