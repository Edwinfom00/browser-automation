"use client"

import { useCallback } from "react"
import { useReactFlow } from "@xyflow/react"

import type { StepNodeType } from "@/modules/workflows/nodes/node-registry"


export function useDeleteNode() {
  const { deleteElements } = useReactFlow<StepNodeType>()

  return useCallback(
    (id: string) => {
      void deleteElements({ nodes: [{ id }] })
    },
    [deleteElements]
  )
}
