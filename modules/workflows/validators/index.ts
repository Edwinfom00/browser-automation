import { z } from "zod"

import {
  WORKFLOW_NAME_MAX_LENGTH,
  WORKFLOW_NAME_MIN_LENGTH,
} from "@/modules/workflows/constants"
import { normalizeWorkflowName } from "@/modules/workflows/lib/workflow-name"


export const workflowNameSchema = z
  .string()
  .transform(normalizeWorkflowName)
  .pipe(
    z
      .string()
      .min(WORKFLOW_NAME_MIN_LENGTH, "Give your workflow a name")
      .max(
        WORKFLOW_NAME_MAX_LENGTH,
        `Keep the name under ${WORKFLOW_NAME_MAX_LENGTH} characters`
      )
  )


export const workflowIdSchema = z.uuid("That workflow no longer exists")


export const createWorkflowSchema = z.object({
  name: workflowNameSchema.optional(),
})

export const renameWorkflowSchema = z.object({
  workflowId: workflowIdSchema,
  name: workflowNameSchema,
})

export const deleteWorkflowSchema = z.object({
  workflowId: workflowIdSchema,
})

export const runWorkflowSchema = z.object({
  workflowId: workflowIdSchema,
})
