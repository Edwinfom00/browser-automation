import { WORKFLOW_ROUTES } from "@/modules/workflows/constants"

export function workflowPath(workflowId: string): string {
  return `${WORKFLOW_ROUTES.root}/${workflowId}`
}
