"use client"

import { LuLoaderCircle, LuTrash2, LuTriangleAlert } from "react-icons/lu"

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
import { useDeleteWorkflow } from "@/modules/workflows/hooks/use-delete-workflow"
import type { WorkflowDeleteTarget } from "@/modules/workflows/types"


export function DeleteWorkflowDialog({
  workflow,
  onOpenChange,
}: {
  workflow: WorkflowDeleteTarget | null
  onOpenChange: (open: boolean) => void
}) {
  const { remove, isPending, error, clearError } = useDeleteWorkflow({
    onDeleted: () => onOpenChange(false),
  })

  return (
    <AlertDialog
      open={workflow !== null}
      onOpenChange={(open) => {
        if (isPending) {
          return
        }

        if (!open) {
          clearError()
        }

        onOpenChange(open)
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="text-destructive">
            <LuTrash2 />
          </AlertDialogMedia>

          <AlertDialogTitle>
            Delete {workflow?.name ?? "this workflow"}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            The workflow and its canvas are removed for everyone in the
            organization. This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error ? (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
          >
            <LuTriangleAlert className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>

       
          <Button
            variant="destructive"
            disabled={isPending || !workflow}
            onClick={() => {
              if (workflow) {
                void remove(workflow.id)
              }
            }}
          >
            {isPending ? (
              <LuLoaderCircle className="size-4 animate-spin" />
            ) : null}
            Delete workflow
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
