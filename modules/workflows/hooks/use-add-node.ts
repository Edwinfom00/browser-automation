"use client"

import { useCallback } from "react"
import { useReactFlow, useStoreApi } from "@xyflow/react"
import { toast } from "sonner"

import {
  nodeRegistry,
  type NodeType,
  type StepNodeType,
} from "@/modules/workflows/nodes/node-registry"


const NODE_HALF_SIZE = { width: 100, height: 24 }


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
  const store = useStoreApi()
  const { getNodes, addNodes } = useReactFlow<StepNodeType>()

  return useCallback(
    (type: NodeType) => {
      const { kind } = nodeRegistry[type]
      const nodes = getNodes()

      if (kind === "trigger" && nodes.some((n) => n.data.kind === "trigger")) {
        toast.error("A workflow can only have one trigger")
        return
      }

      const { width, height, transform } = store.getState()
      const [offsetX, offsetY, zoom] = transform

      addNodes({
        id: crypto.randomUUID(),
        type: "step",
        position: {
          x: (width / 2 - offsetX) / zoom - NODE_HALF_SIZE.width,
          y: (height / 2 - offsetY) / zoom - NODE_HALF_SIZE.height,
        },
        data: {
          type,
          kind,
          title: nextTitle(nodes, type),
          values: {},
        },
      })
    },
    [addNodes, getNodes, store]
  )
}
