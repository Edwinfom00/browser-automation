"use client"

import { memo, useState } from "react"
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from "@xyflow/react"
import { X } from "lucide-react"

import { useDeleteEdge } from "@/modules/workflows/hooks/use-delete-edge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function StepEdgeComponent({
  id,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  markerEnd,
  style,
  selected,
}: EdgeProps) {
  const [hovered, setHovered] = useState(false)
  const deleteEdge = useDeleteEdge()

  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const visible = hovered || selected

  return (
    <>
      <g
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <BaseEdge
          id={id}
          path={path}
          markerEnd={markerEnd}
          style={style}
          interactionWidth={24}
        />
      </g>

      <EdgeLabelRenderer>
        <div
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className={cn(
            "nodrag nopan absolute transition-opacity",
            visible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          )}
        >
          <Button
            size="icon-xs"
            variant="destructive"
            aria-label="Remove connection"
            onClick={() => deleteEdge(id)}
            className="rounded-full border border-border bg-card shadow-xs hover:bg-destructive/10"
          >
            <X />
          </Button>
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

export const StepEdge = memo(StepEdgeComponent)
