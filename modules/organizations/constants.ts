export const ORGANIZATION_ROUTES = {
  select: "/organizations",
} as const

export const DEFAULT_ORGANIZATION_REDIRECT = "/"

export const ORGANIZATION_URL_HOST = "browserautomation.app"

export const ORGANIZATION_NAME_MIN_LENGTH = 2

export const ORGANIZATION_NAME_MAX_LENGTH = 64

export const ORGANIZATION_SLUG_MIN_LENGTH = 3

export const ORGANIZATION_SLUG_MAX_LENGTH = 48

export const ORGANIZATION_LIMIT = 10

export const ORGANIZATION_ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
}
