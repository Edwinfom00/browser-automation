"use client"

import { useCallback } from "react"
import {
  useReactFlow,
  useStore,
  type ReactFlowState,
  type XYPosition,
} from "@xyflow/react"
import { toast } from "sonner"

import {
  nodeRegistry,
  type NodeType,
  type StepNodeType,
} from "@/modules/workflows/nodes/node-registry"


const NODE_HALF_SIZE = { width: 100, height: 24 }


function selectDropPosition(state: ReactFlowState): XYPosition {
  const [offsetX, offsetY, zoom] = state.transform

  return {
    x: (state.width / 2 - offsetX) / zoom - NODE_HALF_SIZE.width,
    y: (state.height / 2 - offsetY) / zoom - NODE_HALF_SIZE.height,
  }
}


function isSamePosition(a: XYPosition, b: XYPosition) {
  return a.x === b.x && a.y === b.y
}


function nextTitle(nodes: StepNodeType[], type: NodeType) {
  const { label } = nodeRegistry[type]
  const pattern = new RegExp(`^${label} (\\d+)$`)

  let highest = 0

  for (const node of nodes) {
    if (node.data.type !== type) {
      continue
    }

    const match = pattern.exec(node.data.title)
    highest = Math.max(highest, match ? Number(match[1]) : 1)
  }

  return `${label} ${highest + 1}`
}


export function useAddNode() {
  const position = useStore(selectDropPosition, isSamePosition)
  const { getNodes, addNodes } = useReactFlow<StepNodeType>()

  return useCallback(
    (type: NodeType) => {
      const { kind } = nodeRegistry[type]
      const nodes = getNodes()

      if (kind === "trigger" && nodes.some((n) => n.data.kind === "trigger")) {
        toast.error("A workflow can only have one trigger")
        return
      }

      addNodes({
        id: crypto.randomUUID(),
        type: "step",
        position,
        data: {
          type,
          kind,
          title: nextTitle(nodes, type),
          values: {},
        },
      })
    },
    [addNodes, getNodes, position]
  )
}
