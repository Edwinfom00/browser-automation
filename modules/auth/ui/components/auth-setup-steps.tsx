import { cn } from "@/lib/utils"

export type SetupStep = {
  id: string
  label: string
}

export const SETUP_STEPS: SetupStep[] = [
  { id: "01", label: "Account" },
  { id: "02", label: "Verify" },
  { id: "03", label: "Workspace" },
]

function StepCard({ step, isActive }: { step: SetupStep; isActive: boolean }) {
  return (
    <div
      className={cn(
        "relative flex w-[19rem] max-w-full items-center gap-4 rounded-xl border px-3 py-3 transition-colors",
        isActive ? "border-blue-500 bg-blue-500/[0.04]" : "border-border"
      )}
    >
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-lg text-sm font-semibold tabular-nums",
          isActive
            ? "bg-blue-600 text-white"
            : "bg-muted text-muted-foreground"
        )}
      >
        {step.id}
      </span>
      <span
        className={cn(
          "text-sm font-medium tracking-[0.14em] uppercase",
          isActive ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {step.label}
      </span>
      <span
        aria-hidden
        className={cn(
          "absolute top-1/2 -right-1.5 size-3 -translate-y-1/2 rounded-full border-2 bg-background",
          isActive ? "border-blue-500" : "border-border"
        )}
      />
    </div>
  )
}

export function AuthSetupSteps({
  activeStep = 0,
  className,
}: {
  activeStep?: number
  className?: string
}) {
  return (
    <ol
      aria-label="Sign-up steps"
      className={cn("flex flex-col select-none", className)}
    >
      {SETUP_STEPS.map((step, index) => (
        <li key={step.id} className="flex flex-col">
          {index > 0 ? (
            <span
              aria-hidden
              className="ml-6 h-8 w-12 rounded-bl-lg border-b border-l border-border"
            />
          ) : null}
          <div style={{ marginLeft: `${index * 2.5}rem` }}>
            <StepCard step={step} isActive={index === activeStep} />
          </div>
        </li>
      ))}
    </ol>
  )
}
