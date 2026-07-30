import type { z } from "zod"

import type { Workflow } from "@/lib/db/schema"
import type { FieldErrors } from "@/modules/auth/types"
import type {
  WORKFLOW_ERROR_MESSAGES,
  WORKFLOW_GRAPH_ERROR_MESSAGES,
} from "@/modules/workflows/constants"
import type { StepNodeType } from "@/modules/workflows/nodes/node-registry"
import type { WorkflowGraph as WorkflowGraphShape } from "@/modules/workflows/types/graph"
import type {
  cancelWorkflowRunSchema,
  createWorkflowSchema,
  deleteWorkflowSchema,
  renameWorkflowSchema,
  runWorkflowSchema,
  saveWorkflowSchema,
} from "@/modules/workflows/validators"

export type CreateWorkflowInput = z.infer<typeof createWorkflowSchema>

export type RenameWorkflowInput = z.infer<typeof renameWorkflowSchema>

export type DeleteWorkflowInput = z.infer<typeof deleteWorkflowSchema>

export type RunWorkflowInput = z.input<typeof runWorkflowSchema>

export type CancelWorkflowRunInput = z.infer<typeof cancelWorkflowRunSchema>

export type SaveWorkflowInput = z.input<typeof saveWorkflowSchema>

export type CreateWorkflowFieldErrors = FieldErrors<CreateWorkflowInput>

export type RenameWorkflowFieldErrors = FieldErrors<RenameWorkflowInput>


export type { WorkflowGraph } from "@/modules/workflows/types/graph"

export type WorkflowGraphIssueCode = keyof typeof WORKFLOW_GRAPH_ERROR_MESSAGES

export type WorkflowGraphIssue = {
  code: WorkflowGraphIssueCode
  message: string
  nodeId?: string
  edgeId?: string
}


export type WorkflowGraphValidation =
  | { ok: true; steps: StepNodeType[]; issues: [] }
  | { ok: false; steps: null; issues: WorkflowGraphIssue[] }



export type WorkflowGraphStatus = {
  ok: boolean
  issues: WorkflowGraphIssue[]
}


export type WorkflowSummary = {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export type WorkflowDetail = Workflow

export type WorkflowWithGraph = {
  id: string
  name: string
  graph: WorkflowGraphShape | null
}

export type WorkflowSaveResult = {
  workflow: WorkflowSummary
  graph: WorkflowGraphStatus
}

export type WorkflowDeleteTarget = {
  id: string
  name?: string
}

export type WorkflowRunHandle = {
  runId: string
  publicAccessToken: string
}


export type WorkflowRunCancellation = {
  runId: string
  status: "CANCELED"
}


export type WorkflowRunProgress = {
  label?: string
  progress?: number
  currentStep?: string
  stepIndex?: number
  totalSteps?: number
  browserSessionId?: string
  liveViewUrl?: string
}

export type WorkflowErrorCode = keyof typeof WORKFLOW_ERROR_MESSAGES

export type WorkflowActionError = {
  code: WorkflowErrorCode
  message: string
}

export type WorkflowActionResult<TData = null> =
  | { data: TData; error: null }
  | { data: null; error: WorkflowActionError }
