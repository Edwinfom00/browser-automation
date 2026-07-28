import type { IconType } from "react-icons"
import {
  LuGlobe,
  LuRefreshCw,
  LuRouteOff,
  LuSearchX,
  LuTriangleAlert,
  LuWorkflow,
} from "react-icons/lu"

import { cn } from "@/lib/utils"
import { AuthBrand } from "@/modules/auth/ui/components/auth-brand"

type SystemStateKind = "not-found" | "error"

const stateDetails: Record<
  SystemStateKind,
  {
    diagramLabel: string
    statusLabel: string
    targetLabel: string
    targetDetail: string
    icon: IconType
    iconClassName: string
  }
> = {
  "not-found": {
    diagramLabel: "Route check",
    statusLabel: "No destination found",
    targetLabel: "Route unavailable",
    targetDetail: "The address is not in this workspace",
    icon: LuSearchX,
    iconClassName: "bg-violet-600 text-white shadow-lg shadow-violet-600/15",
  },
  error: {
    diagramLabel: "Recovery check",
    statusLabel: "Retry is available",
    targetLabel: "Page interrupted",
    targetDetail: "The current step did not finish",
    icon: LuTriangleAlert,
    iconClassName: "bg-destructive/10 text-destructive dark:bg-destructive/15",
  },
}

function DiagramNode({
  icon: Icon,
  title,
  detail,
  className,
  iconClassName,
}: {
  icon: IconType
  title: string
  detail: string
  className?: string
  iconClassName?: string
}) {
  return (
    <div
      className={cn(
        "relative flex items-center gap-3 rounded-xl border border-border bg-background p-3 shadow-sm shadow-foreground/[0.04]",
        className
      )}
    >
      <span
        aria-hidden
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground [&_svg]:size-4.5",
          iconClassName
        )}
      >
        <Icon />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">{title}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {detail}
        </span>
      </span>
    </div>
  )
}

function AutomationRoute({ kind }: { kind: SystemStateKind }) {
  const details = stateDetails[kind]
  const TargetIcon = details.icon

  return (
    <section
      aria-label={details.diagramLabel}
      className="relative min-h-[28rem] overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xl shadow-foreground/[0.04] sm:p-7"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <LuWorkflow aria-hidden className="size-4 text-violet-600" />
          <span>{details.diagramLabel}</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {details.statusLabel}
        </span>
      </div>

      <div className="relative mx-auto mt-10 h-64 max-w-md">
        <DiagramNode
          icon={LuGlobe}
          title="Browser request"
          detail="Address received"
          className="absolute top-0 left-0 w-[min(13rem,calc(100%-1rem))]"
          iconClassName="bg-blue-600 text-white"
        />

        <span
          aria-hidden
          className="absolute top-[3.65rem] left-8 h-14 w-16 rounded-bl-xl border-b border-l border-border sm:left-10 sm:w-24"
        />

        <DiagramNode
          icon={LuRouteOff}
          title="Workspace router"
          detail="Checking the route map"
          className="absolute top-[6.4rem] left-8 w-[calc(100%-2rem)] max-w-56 sm:left-16"
          iconClassName="bg-emerald-600 text-white"
        />

        <span
          aria-hidden
          className="absolute top-[10rem] left-16 h-14 w-16 rounded-bl-xl border-b border-l border-border sm:left-28 sm:w-24"
        />

        <DiagramNode
          icon={TargetIcon}
          title={details.targetLabel}
          detail={details.targetDetail}
          className="absolute top-[12.75rem] left-16 w-[calc(100%-4rem)] sm:left-32 sm:w-[calc(100%-8rem)]"
          iconClassName={details.iconClassName}
        />
      </div>

      <div className="mt-6 flex items-center gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
        {kind === "error" ? (
          <LuRefreshCw aria-hidden className="size-3.5" />
        ) : (
          <LuSearchX aria-hidden className="size-3.5" />
        )}
        <span>
          {kind === "error"
            ? "Your saved workflows are unchanged."
            : "No workflow was changed by this request."}
        </span>
      </div>
    </section>
  )
}

export function SystemState({
  kind,
  code,
  title,
  description,
  actions,
  reference,
}: {
  kind: SystemStateKind
  code: string
  title: string
  description: string
  actions: React.ReactNode
  reference?: string
}) {
  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-[-12rem] size-[32rem] rounded-full bg-violet-500/[0.06] blur-3xl dark:bg-violet-500/[0.08]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden select-none"
      >
        <span className="translate-x-[-0.04em] font-mono text-[clamp(15rem,36vw,38rem)] leading-none font-semibold tracking-[-0.12em] whitespace-nowrap text-violet-600/[0.055] dark:text-violet-400/[0.055]">
          {code}
        </span>
      </div>

      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between gap-4">
          <AuthBrand size="sm" />
          <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
            Automation status
          </span>
        </header>

        <div className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(28rem,1.1fr)] lg:gap-20 lg:py-16">
          <section className="max-w-xl">
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">
              {description}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {actions}
            </div>

            {reference ? (
              <p className="mt-6 font-mono text-xs text-muted-foreground">
                Reference: {reference}
              </p>
            ) : null}
          </section>

          <AutomationRoute kind={kind} />
        </div>
      </div>
    </main>
  )
}
