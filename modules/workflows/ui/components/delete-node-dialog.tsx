"use client"

import { LuTrash2 } from "react-icons/lu"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import type { PendingNodeDelete } from "@/modules/workflows/hooks/use-confirm-node-delete"


function title(pending: PendingNodeDelete | null) {
  if (!pending) {
    return "Delete this step?"
  }

  if (pending.nodes.length === 1) {
    return `Delete ${pending.nodes[0].data.title}?`
  }

  return `Delete ${pending.nodes.length} steps?`
}


function description(pending: PendingNodeDelete | null) {
  const edges = pending?.edges.length ?? 0
  const many = (pending?.nodes.length ?? 1) > 1

  const configured = many
    ? "These steps are already configured."
    : "This step is already configured."

  if (edges === 0) {
    return `${configured} Deleting removes what you filled in, and this can't be undone.`
  }

  return `${configured} Deleting also removes ${edges} ${
    edges === 1 ? "connection" : "connections"
  }, and this can't be undone.`
}


export function DeleteNodeDialog({
  pending,
  onConfirm,
  onCancel,
}: {
  pending: PendingNodeDelete | null
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <AlertDialog
      open={pending !== null}
      onOpenChange={(open) => {
        if (!open) {
          onCancel()
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="text-destructive">
            <LuTrash2 />
          </AlertDialogMedia>

          <AlertDialogTitle>{title(pending)}</AlertDialogTitle>
          <AlertDialogDescription>
            {description(pending)}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <Button variant="destructive" onClick={onConfirm}>
            {(pending?.nodes.length ?? 1) > 1 ? "Delete steps" : "Delete step"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
