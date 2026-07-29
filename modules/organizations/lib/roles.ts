import {
  ORGANIZATION_ROLE_META,
  ORGANIZATION_ROLES,
} from "@/modules/organizations/constants"
import type { OrganizationRole } from "@/modules/organizations/types"

const KNOWN_ROLES = new Set<string>(ORGANIZATION_ROLES)


export function primaryRole(role: string | null | undefined): OrganizationRole {
  const match = (role ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .find((entry) => KNOWN_ROLES.has(entry))

  return (match ?? "member") as OrganizationRole
}

export function roleLabel(role: string | null | undefined): string {
  return ORGANIZATION_ROLE_META[primaryRole(role)].label
}

export function roleDescription(role: string | null | undefined): string {
  return ORGANIZATION_ROLE_META[primaryRole(role)].description
}


const RANK: Record<OrganizationRole, number> = {
  owner: 3,
  admin: 2,
  member: 1,
}

export function roleRank(role: string | null | undefined): number {
  return RANK[primaryRole(role)]
}

export function outranks(
  role: string | null | undefined,
  other: string | null | undefined
): boolean {
  return roleRank(role) > roleRank(other)
}
