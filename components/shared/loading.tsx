import { cn } from "@/lib/utils"
import { AuthLogo } from "@/modules/auth/ui/components/auth-brand"

const loaderSizes = {
  xs: "size-3.5 border-2",
  sm: "size-4 border-2",
  md: "size-6 border-2",
  lg: "size-9 border-[3px]",
} as const

export function Loader({
  size = "sm",
  label = "Loading",
  className,
  ...props
}: Omit<React.ComponentProps<"span">, "children"> & {
  size?: keyof typeof loaderSizes
  label?: string
}) {
  return (
    <span
      data-slot="loader"
      role="status"
      aria-label={label}
      className={cn(
        "inline-block shrink-0 rounded-full border-foreground/15 border-t-violet-600 motion-safe:animate-spin",
        loaderSizes[size],
        className
      )}
      {...props}
    />
  )
}

export function LoadingBar({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="loading-bar"
      aria-hidden
      className={cn(
        "relative h-1 w-full overflow-hidden rounded-full bg-muted",
        className
      )}
      {...props}
    >
      <div className="absolute inset-y-0 left-0 w-full rounded-full bg-violet-600 motion-safe:animate-indeterminate motion-reduce:w-1/3" />
    </div>
  )
}

export function LoadingPanel({
  title = "Loading",
  description,
  bordered = true,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "title"> & {
  title?: React.ReactNode
  description?: React.ReactNode
  bordered?: boolean
}) {
  return (
    <div
      data-slot="loading-panel"
      role="status"
      aria-live="polite"
      className={cn(
        "flex min-h-56 flex-col items-center justify-center gap-4 p-8 text-center motion-safe:animate-rise",
        bordered && "rounded-xl border border-dashed border-border",
        className
      )}
      {...props}
    >
      <Loader size="md" label="Loading" />

      <div className="space-y-1.5">
        <p className="text-sm font-medium">{title}</p>
        {description ? (
          <p className="max-w-xs text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  )
}

export function LoadingOverlay({
  label = "Working…",
  fixed = false,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  label?: React.ReactNode
  fixed?: boolean
}) {
  return (
    <div
      data-slot="loading-overlay"
      role="status"
      aria-live="polite"
      className={cn(
        "z-50 grid place-items-center gap-3 rounded-[inherit] bg-background/70 backdrop-blur-sm motion-safe:animate-rise",
        fixed ? "fixed inset-0" : "absolute inset-0",
        className
      )}
      {...props}
    >
      <div className="flex flex-col items-center gap-3">
        <Loader size="md" label="Loading" />
        {label ? (
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
        ) : null}
      </div>
    </div>
  )
}

export function LoadingScreen({
  title = "Browser Automation",
  label = "Preparing your workspace…",
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "title"> & {
  title?: React.ReactNode
  label?: React.ReactNode
}) {
  return (
    <div
      data-slot="loading-screen"
      role="status"
      aria-live="polite"
      className={cn(
        "relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background px-6",
        className
      )}
      {...props}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 size-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/[0.07] blur-3xl dark:bg-violet-500/[0.09]"
      />

      <div className="relative flex flex-col items-center gap-6 motion-safe:animate-rise">
        <AuthLogo size="md" className="motion-safe:animate-breathe" />

        <div className="space-y-2 text-center">
          <p className="text-lg font-semibold tracking-tight">{title}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>

        <LoadingBar className="w-48" />
      </div>
    </div>
  )
}
