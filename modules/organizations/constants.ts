export const ORGANIZATION_ROUTES = {
  select: "/organizations",
  settings: "/settings/organization",
  members: "/settings/members",
} as const

export function acceptInvitationRoute(invitationId: string): string {
  return `/accept-invitation/${invitationId}`
}

export const DEFAULT_ORGANIZATION_REDIRECT = "/"

export const ORGANIZATION_URL_HOST = "browserautomation.app"

export const ORGANIZATION_NAME_MIN_LENGTH = 2

export const ORGANIZATION_NAME_MAX_LENGTH = 64

export const ORGANIZATION_SLUG_MIN_LENGTH = 3

export const ORGANIZATION_SLUG_MAX_LENGTH = 48

export const ORGANIZATION_LIMIT = 10

export const ORGANIZATION_MEMBERSHIP_LIMIT = 100

export const ORGANIZATION_INVITATION_LIMIT = 50


export const ORGANIZATION_ROLES = ["owner", "admin", "member"] as const


export const ASSIGNABLE_ORGANIZATION_ROLES = ["admin", "member"] as const

export const ORGANIZATION_ROLE_META = {
  owner: {
    label: "Owner",
    description: "Full control, including deleting the organization.",
  },
  admin: {
    label: "Admin",
    description: "Manages members, invitations and organization settings.",
  },
  member: {
    label: "Member",
    description: "Builds and runs workflows.",
  },
} as const

export const ORGANIZATION_ERROR_MESSAGES = {
  UNAUTHORIZED: "Sign in again to continue.",
  NO_ACTIVE_ORGANIZATION: "Pick an organization first.",
  FORBIDDEN: "You don't have permission to do that.",
  ORGANIZATION_NOT_FOUND: "That organization no longer exists.",
  SLUG_TAKEN: "That slug is already taken. Try another one.",
  MEMBER_NOT_FOUND: "That person is no longer in this organization.",
  LAST_OWNER: "Hand ownership to someone else first.",
  MEMBERSHIP_LIMIT_REACHED: `Organizations are capped at ${ORGANIZATION_MEMBERSHIP_LIMIT} members.`,
  INVITATION_NOT_FOUND: "That invitation is no longer valid.",
  INVITATION_LIMIT_REACHED: `Organizations are capped at ${ORGANIZATION_INVITATION_LIMIT} pending invitations.`,
  ALREADY_A_MEMBER: "That person is already in this organization.",
  ALREADY_INVITED: "That person already has a pending invitation.",
  WRONG_RECIPIENT: "This invitation was sent to a different email address.",
  EMAIL_VERIFICATION_REQUIRED: "Verify your email address to continue.",
  VALIDATION_ERROR: "Check the highlighted fields and try again.",
  UNKNOWN_ERROR: "Something went wrong. Try again.",
} as const
