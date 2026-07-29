import { redirect } from "next/navigation"
import { and, asc, count, eq, gt, inArray } from "drizzle-orm"

import { db } from "@/lib/db"
import { invitation, member, organization, user } from "@/lib/db/auth-schema"
import { requireSession } from "@/modules/auth/server/session"
import type { AuthSession } from "@/modules/auth/types"
import { ORGANIZATION_ROUTES } from "@/modules/organizations/constants"
import { roles } from "@/modules/organizations/lib/permissions"
import { primaryRole } from "@/modules/organizations/lib/roles"
import { getActiveInviteCode } from "@/modules/organizations/server/invite-codes"
import type {
  IncomingInvitation,
  OrganizationInvitation,
  OrganizationManageData,
  OrganizationMember,
  OrganizationSummary,
  OrganizationSwitcherData,
  OrganizationViewer,
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

export async function listOrganizationMembers(
  organizationId: string
): Promise<OrganizationMember[]> {
  const rows = await db
    .select({
      id: member.id,
      role: member.role,
      createdAt: member.createdAt,
      userId: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
    })
    .from(member)
    .innerJoin(user, eq(member.userId, user.id))
    .where(eq(member.organizationId, organizationId))
    .orderBy(asc(member.createdAt))

  return rows.map((row) => ({
    id: row.id,
    role: row.role,
    createdAt: row.createdAt,
    user: {
      id: row.userId,
      name: row.name,
      email: row.email,
      image: row.image,
    },
  }))
}


export async function listOrganizationInvitations(
  organizationId: string
): Promise<OrganizationInvitation[]> {
  const rows = await db
    .select({
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
      createdAt: invitation.createdAt,
      inviterId: user.id,
      inviterName: user.name,
      inviterEmail: user.email,
    })
    .from(invitation)
    .innerJoin(user, eq(invitation.inviterId, user.id))
    .where(
      and(
        eq(invitation.organizationId, organizationId),
        eq(invitation.status, "pending"),
        gt(invitation.expiresAt, new Date())
      )
    )
    .orderBy(asc(invitation.createdAt))

  return rows.map((row) => ({
    id: row.id,
    email: row.email,
    role: row.role,
    status: row.status,
    expiresAt: row.expiresAt,
    createdAt: row.createdAt,
    inviter: {
      id: row.inviterId,
      name: row.inviterName,
      email: row.inviterEmail,
    },
  }))
}


export async function listIncomingInvitations(
  email: string
): Promise<IncomingInvitation[]> {
  return db
    .select({
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      expiresAt: invitation.expiresAt,
      organizationId: organization.id,
      organizationName: organization.name,
      organizationSlug: organization.slug,
      organizationLogo: organization.logo,
      inviterName: user.name,
      inviterEmail: user.email,
    })
    .from(invitation)
    .innerJoin(organization, eq(invitation.organizationId, organization.id))
    .innerJoin(user, eq(invitation.inviterId, user.id))
    .where(
      and(
        eq(invitation.email, email.toLowerCase()),
        eq(invitation.status, "pending"),
        gt(invitation.expiresAt, new Date())
      )
    )
    .orderBy(asc(invitation.createdAt))
}

export async function getInvitationForRecipient(
  invitationId: string,
  email: string
): Promise<IncomingInvitation | null> {
  const [row] = await db
    .select({
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      expiresAt: invitation.expiresAt,
      organizationId: organization.id,
      organizationName: organization.name,
      organizationSlug: organization.slug,
      organizationLogo: organization.logo,
      inviterName: user.name,
      inviterEmail: user.email,
    })
    .from(invitation)
    .innerJoin(organization, eq(invitation.organizationId, organization.id))
    .innerJoin(user, eq(invitation.inviterId, user.id))
    .where(
      and(
        eq(invitation.id, invitationId),
        eq(invitation.status, "pending"),
        gt(invitation.expiresAt, new Date())
      )
    )
    .limit(1)


  if (!row || row.email.toLowerCase() !== email.toLowerCase()) {
    return null
  }

  return row
}

export async function findMembership(
  userId: string,
  organizationId: string
): Promise<{ id: string; role: string } | null> {
  const [row] = await db
    .select({ id: member.id, role: member.role })
    .from(member)
    .where(
      and(eq(member.userId, userId), eq(member.organizationId, organizationId))
    )
    .limit(1)

  return row ?? null
}

type PermissionRequest = Parameters<(typeof roles)["owner"]["authorize"]>[0]

export function roleCan(role: string, permissions: PermissionRequest): boolean {
  return roles[primaryRole(role)].authorize(permissions).success
}


export function resolveViewer(
  membership: { id: string; role: string; userId: string },
  ownerCount: number
): OrganizationViewer {
  const role = primaryRole(membership.role)
  const isOwner = role === "owner"

  return {
    memberId: membership.id,
    userId: membership.userId,
    role,
    canUpdateOrganization: roleCan(role, { organization: ["update"] }),
    canDeleteOrganization: roleCan(role, { organization: ["delete"] }),
    canManageMembers: roleCan(role, { member: ["update", "delete"] }),
    canInviteMembers: roleCan(role, { invitation: ["create"] }),
    canTransferOwnership: isOwner,
    canLeave: !(isOwner && ownerCount <= 1),
  }
}

export async function getOrganizationManageData(): Promise<OrganizationManageData> {
  const session = await requireSession()
  const active = await requireActiveOrganization()

  const [members, invitations, inviteCode] = await Promise.all([
    listOrganizationMembers(active.id),
    listOrganizationInvitations(active.id),
    getActiveInviteCode(active.id),
  ])

  const membership = members.find(
    (candidate) => candidate.user.id === session.user.id
  )

  if (!membership) {
    redirect(ORGANIZATION_ROUTES.select)
  }

  const ownerCount = members.filter(
    (candidate) => primaryRole(candidate.role) === "owner"
  ).length

  return {
    organization: { ...active, memberCount: members.length },
    viewer: resolveViewer(
      { id: membership.id, role: membership.role, userId: session.user.id },
      ownerCount
    ),
    members,
    invitations,
    inviteCode,
    ownerCount,
  }
}
