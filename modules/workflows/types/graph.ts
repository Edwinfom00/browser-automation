import type { Edge } from "@xyflow/react"

import type { StepNodeType } from "@/modules/workflows/nodes/node-registry"



export type WorkflowGraph = {
  nodes: StepNodeType[]
  edges: Edge[]
}
