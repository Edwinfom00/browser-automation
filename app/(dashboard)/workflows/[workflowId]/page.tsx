import type { Metadata } from "next"

import { requireActiveOrganization } from "@/modules/organizations/server/organizations"
import {
  getWorkflow,
  requireWorkflow,
} from "@/modules/workflows/server/workflows"
import { ensureWorkflowRoom } from "@/modules/workflows/server/rooms"
import { WorkflowShell } from "@/modules/workflows/ui/components/workflow-shell"
import { Room } from "@/modules/workflows/ui/components/room"

type WorkflowPageProps = {
  params: Promise<{ workflowId: string }>
}

export async function generateMetadata({
  params,
}: WorkflowPageProps): Promise<Metadata> {
  const { workflowId } = await params
  const organization = await requireActiveOrganization()
  const workflow = await getWorkflow(workflowId, organization.id)

  return {
    title: workflow
      ? `${workflow.name} · Browser Automation`
      : "Workflow · Browser Automation",
    robots: { index: false, follow: false },
  }
}

export default async function WorkflowPage({ params }: WorkflowPageProps) {
  const { workflowId } = await params
  const workflow = await requireWorkflow(workflowId)

  await ensureWorkflowRoom(workflow.id, workflow.organizationId)

  return (
    <Room roomId={workflowId}>
      <WorkflowShell workflowId={workflowId} />
    </Room>
  )
}
