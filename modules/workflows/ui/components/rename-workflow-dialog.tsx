"use client"

import { useState } from "react"
import { LuLoaderCircle, LuTriangleAlert } from "react-icons/lu"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { WORKFLOW_NAME_MAX_LENGTH } from "@/modules/workflows/constants"
import { useRenameWorkflow } from "@/modules/workflows/hooks/use-rename-workflow"
import type { WorkflowSummary } from "@/modules/workflows/types"


function RenameWorkflowForm({
  workflow,
  onClose,
}: {
  workflow: WorkflowSummary
  onClose: () => void
}) {
  const { submit, isPending, error, fieldErrors, clearFieldError } =
    useRenameWorkflow()
  const [name, setName] = useState(workflow.name)

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()

        void submit({ workflowId: workflow.id, name }).then((renamed) => {
          if (renamed) {
            onClose()
          }
        })
      }}
      className="flex flex-col gap-4"
    >
      <DialogHeader>
        <DialogTitle>Rename workflow</DialogTitle>
        <DialogDescription>
          Only the name changes — nodes, links and runs stay as they are.
        </DialogDescription>
      </DialogHeader>

      {error ? (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
        >
          <LuTriangleAlert className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="workflow-name">Name</Label>
        <Input
          id="workflow-name"
          name="workflow-name"
          autoComplete="off"
          autoFocus
          spellCheck={false}
          maxLength={WORKFLOW_NAME_MAX_LENGTH}
          value={name}
          disabled={isPending}
          aria-invalid={Boolean(fieldErrors.name)}
          aria-describedby={fieldErrors.name ? "workflow-name-error" : undefined}
          onChange={(event) => {
            setName(event.target.value)
            clearFieldError("name")
          }}
        />
        {fieldErrors.name ? (
          <p id="workflow-name-error" className="text-sm text-destructive">
            {fieldErrors.name}
          </p>
        ) : null}
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button type="submit" disabled={isPending || !name.trim()}>
          {isPending ? <LuLoaderCircle className="size-4 animate-spin" /> : null}
          Save name
        </Button>
      </DialogFooter>
    </form>
  )
}


export function RenameWorkflowDialog({
  workflow,
  onOpenChange,
}: {
  workflow: WorkflowSummary | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={workflow !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        {workflow ? (
          <RenameWorkflowForm
            key={workflow.id}
            workflow={workflow}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
