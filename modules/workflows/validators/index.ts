import { z } from "zod"

import {
  WORKFLOW_GRAPH_MAX_EDGES,
  WORKFLOW_GRAPH_MAX_NODES,
  WORKFLOW_NAME_MAX_LENGTH,
  WORKFLOW_NAME_MIN_LENGTH,
  WORKFLOW_NODE_VALUE_MAX_LENGTH,
} from "@/modules/workflows/constants"
import { normalizeWorkflowName } from "@/modules/workflows/lib/workflow-name"
import {
  nodeRegistry,
  type NodeType,
} from "@/modules/workflows/nodes/node-registry"


export const workflowNameSchema = z
  .string()
  .transform(normalizeWorkflowName)
  .pipe(
    z
      .string()
      .min(WORKFLOW_NAME_MIN_LENGTH, "Give your workflow a name")
      .max(
        WORKFLOW_NAME_MAX_LENGTH,
        `Keep the name under ${WORKFLOW_NAME_MAX_LENGTH} characters`
      )
  )


export const workflowIdSchema = z.uuid("That workflow no longer exists")


export const createWorkflowSchema = z.object({
  name: workflowNameSchema.optional(),
})

export const renameWorkflowSchema = z.object({
  workflowId: workflowIdSchema,
  name: workflowNameSchema,
})

export const deleteWorkflowSchema = z.object({
  workflowId: workflowIdSchema,
})

export const workflowRunIdSchema = z
  .string()
  .trim()
  .regex(/^run_[a-z0-9]+$/i, "That run no longer exists")

export const cancelWorkflowRunSchema = z.object({
  runId: workflowRunIdSchema,
})


const nodeTypeSchema = z.enum(
  Object.keys(nodeRegistry) as [NodeType, ...NodeType[]]
)

const nodePositionSchema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
})

const stepNodeDataSchema = z
  .object({
    type: nodeTypeSchema,
    title: z.string().max(WORKFLOW_NAME_MAX_LENGTH),
    values: z.record(
      z.string(),
      z.string().max(WORKFLOW_NODE_VALUE_MAX_LENGTH)
    ),
  })
  .transform((data) => ({
    ...data,
    // The registry owns the kind, so a client can't relabel an action as a
    // second trigger.
    kind: nodeRegistry[data.type].kind,
  }))

const stepNodeSchema = z.object({
  id: z.string().min(1),
  type: z.literal("step").default("step"),
  position: nodePositionSchema,
  data: stepNodeDataSchema,
})

const workflowEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  sourceHandle: z.string().nullish(),
  targetHandle: z.string().nullish(),
  type: z.string().optional(),
})


export const workflowGraphSchema = z.object({
  nodes: z
    .array(stepNodeSchema)
    .max(
      WORKFLOW_GRAPH_MAX_NODES,
      `Workflows are capped at ${WORKFLOW_GRAPH_MAX_NODES} steps.`
    ),
  edges: z
    .array(workflowEdgeSchema)
    .max(
      WORKFLOW_GRAPH_MAX_EDGES,
      `Workflows are capped at ${WORKFLOW_GRAPH_MAX_EDGES} connections.`
    ),
})

export const saveWorkflowSchema = z.object({
  workflowId: workflowIdSchema,
  graph: workflowGraphSchema,
})


export const runWorkflowSchema = z.object({
  workflowId: workflowIdSchema,
  graph: workflowGraphSchema,
})
