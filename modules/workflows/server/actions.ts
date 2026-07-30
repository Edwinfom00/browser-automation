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
  CancelWorkflowRunInput,
  CreateWorkflowInput,
  DeleteWorkflowInput,
  RenameWorkflowInput,
  RunWorkflowInput,
  SaveWorkflowInput,
  WorkflowActionResult,
  WorkflowErrorCode,
  WorkflowGraph,
  WorkflowRunCancellation,
  WorkflowRunHandle,
  WorkflowSaveResult,
  WorkflowSummary,
} from "@/modules/workflows/types"
import {
  cancelWorkflowRunSchema,
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
  permission: WorkflowPermission | WorkflowPermission[]
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

  const permissions = Array.isArray(permission) ? permission : [permission]

  if (!roleCan(membership.role, { workflow: permissions })) {
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

function workflowTag(workflowId: string): string {
  return `workflow_${workflowId}`
}

function orgTag(organizationId: string): string {
  return `org_${organizationId}`
}


async function persistWorkflowGraph(
  workflowId: string,
  organizationId: string,
  graph: WorkflowGraph
): Promise<{ workflow: WorkflowSummary; error: null } | WorkflowActionFailure> {
  let updated: WorkflowSummary | undefined

  try {
    ;[updated] = await db
      .update(workflows)
      .set({ graph })
      .where(
        and(
          eq(workflows.id, workflowId),
          eq(workflows.organizationId, organizationId)
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

  return { workflow: updated, error: null }
}

async function retrieveRun(runId: string) {
  try {
    return await runs.retrieve(runId)
  } catch (error) {
    console.error("Failed to retrieve a workflow run", error)
    return null
  }
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

  const saved = await persistWorkflowGraph(
    parsed.data.workflowId,
    resolved.context.organizationId,
    graph
  )

  if (saved.error) {
    return saved
  }

  return {
    data: {
      workflow: saved.workflow,
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
  const resolved = await resolveWorkflowContext(["run", "update"])

  if (resolved.error) {
    return resolved
  }

  const parsed = runWorkflowSchema.safeParse(input)

  if (!parsed.success) {
    return failure("VALIDATION_ERROR", firstIssueMessage(parsed.error))
  }

  const graph: WorkflowGraph = parsed.data.graph

  const validation = validateWorkflowGraph(graph)

  if (!validation.ok) {
    return failure("WORKFLOW_GRAPH_INVALID", validation.issues[0]?.message)
  }

  const saved = await persistWorkflowGraph(
    parsed.data.workflowId,
    resolved.context.organizationId,
    graph
  )

  if (saved.error) {
    return saved
  }

  const workflow = saved.workflow

  try {

    const handle = await tasks.trigger<typeof helloWorldTask>(
      "hello-world",
      { message: `Running workflow ${workflow.name}` },
      { tags: [workflowTag(workflow.id), orgTag(resolved.context.organizationId)] }
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

export async function cancelWorkflowRunAction(
  input: CancelWorkflowRunInput
): Promise<WorkflowActionResult<WorkflowRunCancellation>> {
  const resolved = await resolveWorkflowContext("run")

  if (resolved.error) {
    return resolved
  }

  const parsed = cancelWorkflowRunSchema.safeParse(input)

  if (!parsed.success) {
    return failure("WORKFLOW_RUN_NOT_FOUND")
  }

  const { runId } = parsed.data

  const run = await retrieveRun(runId)

  if (!run) {
    return failure("WORKFLOW_RUN_NOT_FOUND")
  }

  if (!run.tags.includes(orgTag(resolved.context.organizationId))) {
    return failure("WORKFLOW_RUN_NOT_FOUND")
  }


  if (run.isCompleted) {
    return failure("WORKFLOW_RUN_FINISHED")
  }

  try {
    const canceled = await runs.cancel(runId)

    return { data: { runId: canceled.id, status: "CANCELED" }, error: null }
  } catch (error) {
    console.error("Failed to cancel a workflow run", error)
    return failure("WORKFLOW_RUN_CANCEL_FAILED")
  }
}

