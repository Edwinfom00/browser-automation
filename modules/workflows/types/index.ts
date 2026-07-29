import type { z } from "zod"

import type { Workflow } from "@/lib/db/schema"
import type { FieldErrors } from "@/modules/auth/types"
import type { WORKFLOW_ERROR_MESSAGES } from "@/modules/workflows/constants"
import type {
  createWorkflowSchema,
  deleteWorkflowSchema,
  renameWorkflowSchema,
} from "@/modules/workflows/validators"

export type CreateWorkflowInput = z.infer<typeof createWorkflowSchema>

export type RenameWorkflowInput = z.infer<typeof renameWorkflowSchema>

export type DeleteWorkflowInput = z.infer<typeof deleteWorkflowSchema>

export type CreateWorkflowFieldErrors = FieldErrors<CreateWorkflowInput>

export type RenameWorkflowFieldErrors = FieldErrors<RenameWorkflowInput>


export type WorkflowSummary = {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export type WorkflowDetail = Workflow

export type WorkflowErrorCode = keyof typeof WORKFLOW_ERROR_MESSAGES

export type WorkflowActionError = {
  code: WorkflowErrorCode
  message: string
}

export type WorkflowActionResult<TData = null> =
  | { data: TData; error: null }
  | { data: null; error: WorkflowActionError }
