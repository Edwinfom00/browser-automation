"use client"

import { useNodesData, useStore, type ReactFlowState } from "@xyflow/react"

import type { StepNodeType } from "@/modules/workflows/nodes/node-registry"


function selectSelectedNodeId(state: ReactFlowState) {
  return state.nodes.find((node) => node.selected)?.id ?? null
}


export function useSelectedNode() {
  const selectedId = useStore(selectSelectedNodeId)

  return useNodesData<StepNodeType>(selectedId ?? "")
}

export type SelectedNode = NonNullable<ReturnType<typeof useSelectedNode>>
