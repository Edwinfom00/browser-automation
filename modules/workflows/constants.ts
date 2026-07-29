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
  UNKNOWN_ERROR: "Something went wrong. Try again.",
} as const
