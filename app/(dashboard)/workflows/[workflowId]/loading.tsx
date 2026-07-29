import { WorkflowViewSkeleton } from "@/modules/workflows/ui/views/workflow-view-skeleton"

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col p-6 sm:p-8">
      <WorkflowViewSkeleton />
    </div>
  )
}
