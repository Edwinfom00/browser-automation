import { LuWorkflow } from "react-icons/lu"

import { EmptyState } from "@/components/shared/empty-state"
import { CreateWorkflowButton } from "@/modules/workflows/ui/components/create-workflow-button"

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
      action={action ?? <CreateWorkflowButton className="px-4" />}
    />
  )
}
