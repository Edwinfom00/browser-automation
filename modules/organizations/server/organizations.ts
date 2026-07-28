import { redirect } from "next/navigation"
import { asc, count, eq, inArray } from "drizzle-orm"

import { db } from "@/lib/db"
import { member, organization } from "@/lib/db/auth-schema"
import { requireSession } from "@/modules/auth/server/session"
import type { AuthSession } from "@/modules/auth/types"
import { ORGANIZATION_ROUTES } from "@/modules/organizations/constants"
import type {
  OrganizationSummary,
  OrganizationSwitcherData,
} from "@/modules/organizations/types"

export async function listUserOrganizations(
  userId: string
): Promise<OrganizationSummary[]> {
  const memberships = await db
    .select({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      logo: organization.logo,
      role: member.role,
    })
    .from(member)
    .innerJoin(organization, eq(member.organizationId, organization.id))
    .where(eq(member.userId, userId))
    .orderBy(asc(organization.createdAt))

  if (memberships.length === 0) {
    return []
  }

  const memberCounts = await db
    .select({
      organizationId: member.organizationId,
      total: count(),
    })
    .from(member)
    .where(
      inArray(
        member.organizationId,
        memberships.map((membership) => membership.id)
      )
    )
    .groupBy(member.organizationId)

  const totals = new Map(
    memberCounts.map((row) => [row.organizationId, row.total])
  )

  return memberships.map((membership) => ({
    ...membership,
    memberCount: totals.get(membership.id) ?? 1,
  }))
}

/** Pass an already-resolved session to avoid a second lookup per request. */
export async function getOrganizationSwitcherData(
  session?: AuthSession
): Promise<OrganizationSwitcherData> {
  const resolved = session ?? (await requireSession())
  const organizations = await listUserOrganizations(resolved.user.id)

  return {
    organizations,
    activeOrganizationId: resolved.session.activeOrganizationId ?? null,
  }
}

export async function getActiveOrganizationId(): Promise<string | null> {
  const session = await requireSession()

  return session.session.activeOrganizationId ?? null
}

export async function requireActiveOrganization(): Promise<OrganizationSummary> {
  const session = await requireSession()
  const activeOrganizationId = session.session.activeOrganizationId

  if (!activeOrganizationId) {
    redirect(ORGANIZATION_ROUTES.select)
  }

  const organizations = await listUserOrganizations(session.user.id)
  const active = organizations.find(
    (candidate) => candidate.id === activeOrganizationId
  )

  if (!active) {
    redirect(ORGANIZATION_ROUTES.select)
  }

  return active
}
