import {
  nodeRegistry,
  type NodeDefinition,
  type StepNodeType,
} from "@/modules/workflows/nodes/node-registry"



export function isNodeConfigured(node: StepNodeType): boolean {
  const def: NodeDefinition | undefined = nodeRegistry[node.data.type]

  if (!def) {
    return false
  }

  return def.fields.some((field) => !!node.data.values[field.key]?.trim())
}
