"use server"

import { revalidatePath } from "next/cache"
import { runs, tasks } from "@trigger.dev/sdk"
import { and, eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { member } from "@/lib/db/auth-schema"
import { deleteRoom } from "@/lib/liveblocks"
import { workflows } from "@/lib/db/schema"
import { getSession } from "@/modules/auth/server/session"
import { roleCan } from "@/modules/organizations/server/organizations"
import {
  WORKFLOW_ERROR_MESSAGES,
  WORKFLOW_LIMIT,
} from "@/modules/workflows/constants"
import { validateWorkflowGraph } from "@/modules/workflows/lib/validate-graph"
import { randomWorkflowName } from "@/modules/workflows/lib/workflow-name"
import { countWorkflows } from "@/modules/workflows/server/workflows"
import type {
  CreateWorkflowInput,
  DeleteWorkflowInput,
  RenameWorkflowInput,
  RunWorkflowInput,
  SaveWorkflowInput,
  WorkflowActionResult,
  WorkflowErrorCode,
  WorkflowGraph,
  WorkflowRunHandle,
  WorkflowSaveResult,
  WorkflowSummary,
} from "@/modules/workflows/types"
import {
  createWorkflowSchema,
  deleteWorkflowSchema,
  renameWorkflowSchema,
  runWorkflowSchema,
  saveWorkflowSchema,
} from "@/modules/workflows/validators"
import type { helloWorldTask } from "@/trigger/example"

type WorkflowActionFailure = { data: null; error: { code: WorkflowErrorCode; message: string } }

function failure(
  code: WorkflowErrorCode,
  message?: string
): WorkflowActionFailure {
  return {
    data: null,
    error: { code, message: message ?? WORKFLOW_ERROR_MESSAGES[code] },
  }
}

function firstIssueMessage(error: { issues: Array<{ message: string }> }): string {
  return error.issues[0]?.message ?? WORKFLOW_ERROR_MESSAGES.VALIDATION_ERROR
}


const summaryColumns = {
  id: workflows.id,
  name: workflows.name,
  createdAt: workflows.createdAt,
  updatedAt: workflows.updatedAt,
}

type WorkflowContext = {
  userId: string
  organizationId: string
  role: string
}

type WorkflowPermission = "create" | "update" | "delete" | "run"


async function resolveWorkflowContext(
  permission: WorkflowPermission
): Promise<{ context: WorkflowContext; error: null } | WorkflowActionFailure> {
  const session = await getSession()

  if (!session) {
    return failure("UNAUTHORIZED")
  }

  const organizationId = session.session.activeOrganizationId

  if (!organizationId) {
    return failure("NO_ACTIVE_ORGANIZATION")
  }

  const [membership] = await db
    .select({ id: member.id, role: member.role })
    .from(member)
    .where(
      and(
        eq(member.userId, session.user.id),
        eq(member.organizationId, organizationId)
      )
    )
    .limit(1)

  if (!membership) {
    return failure("FORBIDDEN")
  }

  if (!roleCan(membership.role, { workflow: [permission] })) {
    return failure("FORBIDDEN")
  }

  return {
    context: {
      userId: session.user.id,
      organizationId,
      role: membership.role,
    },
    error: null,
  }
}


function revalidateWorkflows(): void {
  revalidatePath("/", "layout")
}

export async function createWorkflow(
  input: CreateWorkflowInput = {}
): Promise<WorkflowActionResult<WorkflowSummary>> {
  const resolved = await resolveWorkflowContext("create")

  if (resolved.error) {
    return resolved
  }

  const parsed = createWorkflowSchema.safeParse(input ?? {})

  if (!parsed.success) {
    return failure("VALIDATION_ERROR", firstIssueMessage(parsed.error))
  }

  const { organizationId } = resolved.context

  if ((await countWorkflows(organizationId)) >= WORKFLOW_LIMIT) {
    return failure("WORKFLOW_LIMIT_REACHED")
  }

  const [created] = await db
    .insert(workflows)
    .values({
      organizationId,
      name: parsed.data.name ?? randomWorkflowName(),
      graph: { nodes: [], edges: [] },
    })
    .returning(summaryColumns)

  if (!created) {
    return failure("UNKNOWN_ERROR")
  }

  revalidateWorkflows()

  return { data: created, error: null }
}

export async function renameWorkflow(
  input: RenameWorkflowInput
): Promise<WorkflowActionResult<WorkflowSummary>> {
  const resolved = await resolveWorkflowContext("update")

  if (resolved.error) {
    return resolved
  }

  const parsed = renameWorkflowSchema.safeParse(input)

  if (!parsed.success) {
    return failure("VALIDATION_ERROR", firstIssueMessage(parsed.error))
  }

  const [updated] = await db
    .update(workflows)
    .set({ name: parsed.data.name })
    .where(
      and(
        eq(workflows.id, parsed.data.workflowId),
        eq(workflows.organizationId, resolved.context.organizationId)
      )
    )
    .returning(summaryColumns)

  if (!updated) {
    return failure("WORKFLOW_NOT_FOUND")
  }

  revalidateWorkflows()

  return { data: updated, error: null }
}

export async function saveWorkflow(
  input: SaveWorkflowInput
): Promise<WorkflowActionResult<WorkflowSaveResult>> {
  const resolved = await resolveWorkflowContext("update")

  if (resolved.error) {
    return resolved
  }

  const parsed = saveWorkflowSchema.safeParse(input)

  if (!parsed.success) {
    return failure("VALIDATION_ERROR", firstIssueMessage(parsed.error))
  }

  const graph: WorkflowGraph = parsed.data.graph

  const validation = validateWorkflowGraph(graph)

  let updated: WorkflowSummary | undefined

  try {
    ;[updated] = await db
      .update(workflows)
      .set({ graph })
      .where(
        and(
          eq(workflows.id, parsed.data.workflowId),
          eq(workflows.organizationId, resolved.context.organizationId)
        )
      )
      .returning(summaryColumns)
  } catch (error) {
    console.error("Failed to save a workflow graph", error)
    return failure("WORKFLOW_SAVE_FAILED")
  }

  if (!updated) {
    return failure("WORKFLOW_NOT_FOUND")
  }

  revalidateWorkflows()

  return {
    data: {
      workflow: updated,
      graph: { ok: validation.ok, issues: validation.issues },
    },
    error: null,
  }
}

export async function deleteWorkflow(
  input: DeleteWorkflowInput
): Promise<WorkflowActionResult<{ id: string }>> {
  const resolved = await resolveWorkflowContext("delete")

  if (resolved.error) {
    return resolved
  }

  const parsed = deleteWorkflowSchema.safeParse(input)

  if (!parsed.success) {
    return failure("WORKFLOW_NOT_FOUND")
  }

  const scope = and(
    eq(workflows.id, parsed.data.workflowId),
    eq(workflows.organizationId, resolved.context.organizationId)
  )


  const [workflow] = await db
    .select({ id: workflows.id })
    .from(workflows)
    .where(scope)
    .limit(1)

  if (!workflow) {
    return failure("WORKFLOW_NOT_FOUND")
  }


  try {
    await deleteRoom(workflow.id)
  } catch (error) {
    console.error("Failed to delete the Liveblocks room for a workflow", error)
    return failure("WORKFLOW_DELETE_FAILED")
  }

  const [deleted] = await db
    .delete(workflows)
    .where(scope)
    .returning({ id: workflows.id })

  if (!deleted) {
    return failure("WORKFLOW_NOT_FOUND")
  }

  revalidateWorkflows()

  return { data: deleted, error: null }
}

export async function runWorkflowAction(
  input: RunWorkflowInput
): Promise<WorkflowActionResult<WorkflowRunHandle>> {
  const resolved = await resolveWorkflowContext("run")

  if (resolved.error) {
    return resolved
  }

  const parsed = runWorkflowSchema.safeParse(input)

  if (!parsed.success) {
    return failure("WORKFLOW_NOT_FOUND")
  }

  const [workflow] = await db
    .select({ id: workflows.id, name: workflows.name })
    .from(workflows)
    .where(
      and(
        eq(workflows.id, parsed.data.workflowId),
        eq(workflows.organizationId, resolved.context.organizationId)
      )
    )
    .limit(1)

  if (!workflow) {
    return failure("WORKFLOW_NOT_FOUND")
  }

  try {

    const handle = await tasks.trigger<typeof helloWorldTask>(
      "hello-world",
      { message: `Running workflow ${workflow.name}` },
      { tags: [`workflow_${workflow.id}`, `org_${resolved.context.organizationId}`] }
    )

    return {
      data: { runId: handle.id, publicAccessToken: handle.publicAccessToken },
      error: null,
    }
  } catch (error) {
    console.error("Failed to trigger workflow run", error)
    return failure("WORKFLOW_RUN_FAILED")
  }
}

