"use client"

import { useNodesData, useStore, type ReactFlowState } from "@xyflow/react"

import type { StepNodeType } from "@/modules/workflows/nodes/node-registry"

// The editor inspects one node at a time, so the first selected one wins.
function selectSelectedNodeId(state: ReactFlowState) {
  return state.nodes.find((node) => node.selected)?.id ?? null
}

/**
 * The node currently selected on the canvas, or null when nothing is selected.
 * Reads through the shared React Flow provider, so the sidebar stays in sync
 * with the canvas without either owning the selection.
 */
export function useSelectedNode() {
  const selectedId = useStore(selectSelectedNodeId)

  // Subscribes to that one node's data, so edits re-render the editor only.
  return useNodesData<StepNodeType>(selectedId ?? "")
}

export type SelectedNode = NonNullable<ReturnType<typeof useSelectedNode>>
