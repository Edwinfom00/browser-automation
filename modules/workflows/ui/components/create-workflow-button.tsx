"use client"

import { LuLoaderCircle, LuPlus } from "react-icons/lu"

import { Button } from "@/components/ui/button"

import { useCreateWorkflow } from "@/modules/workflows/hooks/use-create-workflow"


export function CreateWorkflowButton({
  label = "New workflow",
  size = "lg",
  className,
}: {
  label?: string
  size?: React.ComponentProps<typeof Button>["size"]
  className?: string
}) {
  const { submit, isPending, error } = useCreateWorkflow()

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        size={size}
        className={className}
        disabled={isPending}
        onClick={() => void submit()}
      >
        {isPending ? (
          <LuLoaderCircle data-icon="inline-start" className="animate-spin" />
        ) : (
          <LuPlus data-icon="inline-start" />
        )}
        {label}
      </Button>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}
