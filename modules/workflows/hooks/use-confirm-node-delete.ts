"use client"

import { useCallback, useRef, useState } from "react"
import type { Edge, OnBeforeDelete } from "@xyflow/react"

import { isNodeConfigured } from "@/modules/workflows/lib/node-configured"
import type { StepNodeType } from "@/modules/workflows/nodes/node-registry"


export type PendingNodeDelete = {
  nodes: StepNodeType[]
  edges: Edge[]
}


export function useConfirmNodeDelete() {
  const [pending, setPending] = useState<PendingNodeDelete | null>(null)
  const resolveRef = useRef<((confirmed: boolean) => void) | null>(null)

  const settle = useCallback((confirmed: boolean) => {
    resolveRef.current?.(confirmed)
    resolveRef.current = null
    setPending(null)
  }, [])

  const onBeforeDelete = useCallback<OnBeforeDelete<StepNodeType, Edge>>(
    ({ nodes, edges }) => {
      if (!nodes.some(isNodeConfigured)) {
        return Promise.resolve(true)
      }

      resolveRef.current?.(false)

      return new Promise<boolean>((resolve) => {
        resolveRef.current = resolve
        setPending({ nodes, edges })
      })
    },
    []
  )

  const confirm = useCallback(() => settle(true), [settle])
  const cancel = useCallback(() => settle(false), [settle])

  return { pending, onBeforeDelete, confirm, cancel }
}
