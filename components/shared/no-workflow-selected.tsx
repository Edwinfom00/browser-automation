import { LuPlus, LuWorkflow } from "react-icons/lu"

import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"

export function NoWorkflowSelected({
  action,
}: {
  action?: React.ReactNode
}) {
  return (
    <EmptyState
      icon={<LuWorkflow />}
      title="No workflow selected"
      description="Select a workflow from the sidebar or create a new one to get started."
      action={
        action ?? (
          <Button size="lg" className="px-4">
            <LuPlus data-icon="inline-start" />
            New workflow
          </Button>
        )
      }
    />
  )
}
