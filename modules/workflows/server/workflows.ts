import { notFound } from "next/navigation"
import { and, count, desc, eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { workflows } from "@/lib/db/schema"
import { requireSession } from "@/modules/auth/server/session"
import type { AuthSession } from "@/modules/auth/types"
import { requireActiveOrganization } from "@/modules/organizations/server/organizations"
import type {
  WorkflowDetail,
  WorkflowSummary,
} from "@/modules/workflows/types"
import { workflowIdSchema } from "@/modules/workflows/validators"


const summaryColumns = {
  id: workflows.id,
  name: workflows.name,
  createdAt: workflows.createdAt,
  updatedAt: workflows.updatedAt,
}


export async function listWorkflows(
  organizationId: string
): Promise<WorkflowSummary[]> {
  return db
    .select(summaryColumns)
    .from(workflows)
    .where(eq(workflows.organizationId, organizationId))
    .orderBy(desc(workflows.updatedAt))
}

export async function countWorkflows(
  organizationId: string
): Promise<number> {
  const [row] = await db
    .select({ total: count() })
    .from(workflows)
    .where(eq(workflows.organizationId, organizationId))

  return row?.total ?? 0
}


export async function getOrganizationWorkflows(
  session?: AuthSession
): Promise<WorkflowSummary[]> {
  const resolved = session ?? (await requireSession())
  const organizationId = resolved.session.activeOrganizationId

  if (!organizationId) {
    return []
  }

  return listWorkflows(organizationId)
}


export async function getWorkflow(
  workflowId: string,
  organizationId: string
): Promise<WorkflowDetail | null> {
  if (!workflowIdSchema.safeParse(workflowId).success) {
    return null
  }

  const [workflow] = await db
    .select()
    .from(workflows)
    .where(
      and(
        eq(workflows.id, workflowId),
        eq(workflows.organizationId, organizationId)
      )
    )
    .limit(1)

  return workflow ?? null
}


export async function requireWorkflow(
  workflowId: string
): Promise<WorkflowDetail> {
  const organization = await requireActiveOrganization()
  const workflow = await getWorkflow(workflowId, organization.id)

  if (!workflow) {
    notFound()
  }

  return workflow
}
