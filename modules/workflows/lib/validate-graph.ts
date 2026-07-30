import toposort from "toposort"

import { WORKFLOW_GRAPH_ERROR_MESSAGES } from "@/modules/workflows/constants"
import {
  nodeRegistry,
  type NodeType,
  type StepNodeType,
} from "@/modules/workflows/nodes/node-registry"
import type {
  WorkflowGraph,
  WorkflowGraphIssue,
  WorkflowGraphIssueCode,
  WorkflowGraphValidation,
} from "@/modules/workflows/types"


function issue(
  code: WorkflowGraphIssueCode,
  target?: { nodeId?: string; edgeId?: string }
): WorkflowGraphIssue {
  return {
    code,
    message: WORKFLOW_GRAPH_ERROR_MESSAGES[code],
    ...target,
  }
}


function isKnownNodeType(type: string): type is NodeType {
  return type in nodeRegistry
}



const ISSUE_PRIORITY: Record<WorkflowGraphIssueCode, number> = {
  EMPTY_GRAPH: 0,
  DUPLICATE_NODE_ID: 1,
  UNKNOWN_NODE_TYPE: 2,
  MISSING_TRIGGER: 3,
  MULTIPLE_TRIGGERS: 4,
  CYCLE: 5,
  DANGLING_EDGE: 6,
  DISCONNECTED_NODE: 7,
  MISSING_FIELD: 8,
}

function byPriority(a: WorkflowGraphIssue, b: WorkflowGraphIssue): number {
  return ISSUE_PRIORITY[a.code] - ISSUE_PRIORITY[b.code]
}



function hasMissingFields(node: StepNodeType, type: NodeType): boolean {
  return nodeRegistry[type].fields.some(
    (field) => field.required && !node.data.values[field.key]?.trim()
  )
}



export function validateWorkflowGraph(
  graph: WorkflowGraph | null | undefined
): WorkflowGraphValidation {
  const nodes = graph?.nodes ?? []
  const edges = graph?.edges ?? []

  if (nodes.length === 0) {
    return { ok: false, steps: null, issues: [issue("EMPTY_GRAPH")] }
  }

  const issues: WorkflowGraphIssue[] = []
  const byId = new Map<string, StepNodeType>()

  for (const node of nodes) {
    if (byId.has(node.id)) {
      issues.push(issue("DUPLICATE_NODE_ID", { nodeId: node.id }))
      continue
    }

    byId.set(node.id, node)

    const type = node.data.type

    if (!isKnownNodeType(type)) {
      issues.push(issue("UNKNOWN_NODE_TYPE", { nodeId: node.id }))
      continue
    }

    if (hasMissingFields(node, type)) {
      issues.push(issue("MISSING_FIELD", { nodeId: node.id }))
    }
  }

  const triggers = nodes.filter((node) => node.data.kind === "trigger")

  if (triggers.length === 0) {
    issues.push(issue("MISSING_TRIGGER"))
  }

  for (const extra of triggers.slice(1)) {
    issues.push(issue("MULTIPLE_TRIGGERS", { nodeId: extra.id }))
  }


  const pairs: [string, string][] = []
  const outgoing = new Map<string, string[]>()

  for (const edge of edges) {
    if (!byId.has(edge.source) || !byId.has(edge.target)) {
      issues.push(issue("DANGLING_EDGE", { edgeId: edge.id }))
      continue
    }

    if (edge.source === edge.target) {
      issues.push(issue("CYCLE", { nodeId: edge.source, edgeId: edge.id }))
      continue
    }

    pairs.push([edge.source, edge.target])
    outgoing.set(edge.source, [
      ...(outgoing.get(edge.source) ?? []),
      edge.target,
    ])
  }

  let sortedIds: string[] = []

  try {

    sortedIds = toposort.array([...byId.keys()], pairs)
  } catch {
    issues.push(issue("CYCLE"))
  }

  const trigger = triggers[0]

  if (trigger) {
    const reached = new Set<string>([trigger.id])
    const queue = [trigger.id]

    while (queue.length > 0) {
      const current = queue.shift()!

      for (const next of outgoing.get(current) ?? []) {
        if (!reached.has(next)) {
          reached.add(next)
          queue.push(next)
        }
      }
    }

    for (const node of byId.values()) {
      if (!reached.has(node.id)) {
        issues.push(issue("DISCONNECTED_NODE", { nodeId: node.id }))
      }
    }
  }

  if (issues.length > 0) {
    return { ok: false, steps: null, issues: issues.sort(byPriority) }
  }

  return {
    ok: true,
    steps: sortedIds.map((id) => byId.get(id)!),
    issues: [],
  }
}
