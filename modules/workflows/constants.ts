export const WORKFLOW_ROUTES = {
  root: "/workflows",
} as const


export const DEFAULT_WORKFLOW_REDIRECT = "/"

export const WORKFLOW_NAME_MIN_LENGTH = 2

export const WORKFLOW_NAME_MAX_LENGTH = 64


export const WORKFLOW_LIMIT = 100

export const WORKFLOW_ERROR_MESSAGES = {
  UNAUTHORIZED: "Sign in again to continue.",
  NO_ACTIVE_ORGANIZATION: "Pick an organization before creating workflows.",
  FORBIDDEN: "You don't have access to this organization.",
  WORKFLOW_NOT_FOUND: "That workflow no longer exists.",
  WORKFLOW_LIMIT_REACHED: `Organizations are capped at ${WORKFLOW_LIMIT} workflows.`,
  VALIDATION_ERROR: "Check the highlighted fields and try again.",
  WORKFLOW_DELETE_FAILED: "We couldn't finish deleting this workflow. Try again.",
  WORKFLOW_RUN_FAILED: "We couldn't start this run. Try again.",
  UNKNOWN_ERROR: "Something went wrong. Try again.",
} as const



export const WORKFLOW_RUN_STATUS_LABELS: Record<string, string> = {
  WAITING_FOR_DEPLOY: "Waiting for deploy",
  QUEUED: "Queued",
  DELAYED: "Delayed",
  EXECUTING: "Running",
  REATTEMPTING: "Retrying",
  FROZEN: "Paused",
  COMPLETED: "Completed",
  CANCELED: "Canceled",
  FAILED: "Failed",
  CRASHED: "Crashed",
  INTERRUPTED: "Interrupted",
  SYSTEM_FAILURE: "System failure",
  EXPIRED: "Expired",
  TIMED_OUT: "Timed out",
}

export const WORKFLOW_RUN_ACTIVE_STATUSES = new Set([
  "WAITING_FOR_DEPLOY",
  "QUEUED",
  "DELAYED",
  "EXECUTING",
  "REATTEMPTING",
  "FROZEN",
])

export const WORKFLOW_RUN_FAILED_STATUSES = new Set([
  "FAILED",
  "CRASHED",
  "SYSTEM_FAILURE",
  "INTERRUPTED",
  "EXPIRED",
  "TIMED_OUT",
  "CANCELED",
])
