import { AbortTaskRunError, logger, metadata, schemaTask } from "@trigger.dev/sdk"
import toposort from "toposort"
import { z } from "zod"

import { validateWorkflowGraph } from "@/modules/workflows/lib/validate-graph"
import type { NodeType, StepNodeType } from "@/modules/workflows/nodes/node-registry"
import { getWorkflowGraph } from "@/modules/workflows/server/workflows"
import type { WorkflowGraph } from "@/modules/workflows/types"
import { workflowIdSchema } from "@/modules/workflows/validators"


export const runWorkflowPayloadSchema = z.object({
  workflowId: workflowIdSchema,
  organizationId: z.string().min(1),
})

export type RunWorkflowPayload = z.infer<typeof runWorkflowPayloadSchema>


type StepStatus = "completed" | "skipped"

type StepOutcome = {
  status: StepStatus
  detail: string
}

export type WorkflowStepResult = StepOutcome & {
  id: string
  title: string
  type: NodeType
}

type StepContext = {
  node: StepNodeType
  values: Record<string, string>
  workflowId: string
  index: number
  total: number
}

type StepRunner = (context: StepContext) => Promise<StepOutcome>


/**
 * One runner per node type. The `Record<NodeType, ...>` annotation keeps this
 * exhaustive: adding a node to the registry without teaching the executor how
 * to run it is a type error.
 *
 * TODO: every action below still describes the work instead of doing it. Swap
 * each body for the real browser task once those exist — the shape stays the
 * same, only the middle changes.
 */
const stepRunners: Record<NodeType, StepRunner> = {
  start: async () => ({
    status: "skipped",
    detail: "Trigger reached — nothing to execute.",
  }),

  "open-url": async ({ values }) => {
    const url = values.url?.trim() ?? ""

    // TODO: hand this to the browser session task, e.g.
    // await openUrlTask.triggerAndWait({ url }).unwrap()
    return { status: "completed", detail: `Opened ${url}` }
  },
}


function buildExecutionPlan(graph: WorkflowGraph): StepNodeType[] {
  const nodesById = new Map<string, StepNodeType>()

  for (const node of graph.nodes) {
    nodesById.set(node.id, node)
  }

  const seenEdges = new Set<string>()
  const pairs: [string, string][] = []

  for (const edge of graph.edges) {
    const key = `${edge.source}->${edge.target}`

    
    if (seenEdges.has(key)) {
      continue
    }

    if (!nodesById.has(edge.source) || !nodesById.has(edge.target)) {
      continue
    }

    seenEdges.add(key)
    pairs.push([edge.source, edge.target])
  }

  let orderedIds: string[]

  try {
    orderedIds = toposort.array([...nodesById.keys()], pairs)
  } catch {
    throw new AbortTaskRunError("Steps loop back on themselves — fix the canvas and run again.")
  }

  return orderedIds.map((id) => nodesById.get(id)!)
}


function titleOf(node: StepNodeType): string {
  return node.data.title?.trim() || node.data.type
}


export const runWorkflowTask = schemaTask({
  id: "run-workflow",
  schema: runWorkflowPayloadSchema,
  maxDuration: 900,
  retry: { maxAttempts: 1 },
  run: async ({ workflowId, organizationId }) => {
    metadata.set("label", "Loading workflow").set("progress", 0)

    const workflow = await getWorkflowGraph(workflowId, organizationId)

    if (!workflow) {
      throw new AbortTaskRunError("That workflow no longer exists.")
    }

    logger.log("Loaded workflow", { workflowId, name: workflow.name })

    const validation = validateWorkflowGraph(workflow.graph)

    if (!validation.ok) {
      const reason = validation.issues[0]?.message ?? "This workflow can't run yet."

      logger.error("Workflow graph is invalid", {
        workflowId,
        issues: validation.issues,
      })

      throw new AbortTaskRunError(reason)
    }

    const plan = buildExecutionPlan(workflow.graph!)
    const total = plan.length

    logger.log("Execution plan ready", {
      workflowId,
      total,
      steps: plan.map((node, index) => `${index + 1}. ${titleOf(node)}`),
    })

    metadata
      .set("label", `Running ${workflow.name}`)
      .set("progress", 0)
      .set("totalSteps", total)

    const results: WorkflowStepResult[] = []

    for (const [index, node] of plan.entries()) {
      const title = titleOf(node)
      const type = node.data.type
      const position = `${index + 1}/${total}`

      metadata
        .set("label", `${position} · ${title}`)
        .set("stepIndex", index + 1)
        .set("currentStep", title)

      logger.log(`Step ${position}: ${title}`, {
        workflowId,
        nodeId: node.id,
        type,
      })

      const outcome = await logger.trace(`step:${title}`, () =>
        stepRunners[type]({
          node,
          values: node.data.values,
          workflowId,
          index,
          total,
        })
      )

      results.push({ id: node.id, title, type, ...outcome })

      logger.log(`Step ${position} ${outcome.status}: ${title}`, {
        workflowId,
        nodeId: node.id,
        detail: outcome.detail,
      })

      metadata.set("progress", Math.round(((index + 1) / total) * 100))
    }

    const executed = results.filter((step) => step.status === "completed").length

    metadata.set("label", "Finished").set("progress", 100)

    logger.log("Workflow finished", { workflowId, total, executed })

    return {
      message: `Ran ${executed} of ${total} steps in ${workflow.name}.`,
      workflowId,
      workflowName: workflow.name,
      totalSteps: total,
      executedSteps: executed,
      steps: results,
    }
  },
})
