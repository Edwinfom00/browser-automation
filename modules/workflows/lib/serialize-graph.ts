import type { Edge } from "@xyflow/react"

import type { StepNodeType } from "@/modules/workflows/nodes/node-registry"
import type { WorkflowGraph } from "@/modules/workflows/types"


export function serializeWorkflowGraph(
  nodes: StepNodeType[],
  edges: Edge[]
): WorkflowGraph {
  return {
    nodes: nodes.map((node) => ({
      id: node.id,
      type: "step",
      position: node.position,
      data: {
        type: node.data.type,
        kind: node.data.kind,
        title: node.data.title,
        values: node.data.values,
      },
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      type: edge.type,
    })),
  }
}
