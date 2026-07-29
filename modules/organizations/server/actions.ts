"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { isAPIError } from "better-auth/api"

import { auth } from "@/lib/auth"
import { getSession } from "@/modules/auth/server/session"
import { ORGANIZATION_ERROR_MESSAGES } from "@/modules/organizations/constants"
import { primaryRole } from "@/modules/organizations/lib/roles"
import { findMembership } from "@/modules/organizations/server/organizations"
import type {
  InviteMemberInput,
  OrganizationActionError,
  OrganizationActionResult,
  OrganizationErrorCode,
  UpdateMemberRoleInput,
  UpdateOrganizationInput,
} from "@/modules/organizations/types"
import {
  invitationActionSchema,
  inviteMemberSchema,
  memberActionSchema,
  updateMemberRoleSchema,
  updateOrganizationSchema,
} from "@/modules/organizations/validators"

type Failure = { data: null; error: OrganizationActionError }

function failure(
  code: OrganizationErrorCode,
  options: { message?: string; field?: string } = {}
): Failure {
  return {
    data: null,
    error: {
      code,
      message: options.message ?? ORGANIZATION_ERROR_MESSAGES[code],
      ...(options.field ? { field: options.field } : {}),
    },
  }
}

function validationFailure(
  error: { issues: Array<{ message: string; path: PropertyKey[] }> }
): Failure {
  const issue = error.issues[0]

  return failure("VALIDATION_ERROR", {
    message: issue?.message,
    field: typeof issue?.path[0] === "string" ? issue.path[0] : undefined,
  })
}


const ERROR_CODE_MAP: Record<
  string,
  { code: OrganizationErrorCode; field?: string }
> = {
  ORGANIZATION_SLUG_ALREADY_TAKEN: { code: "SLUG_TAKEN", field: "slug" },
  ORGANIZATION_ALREADY_EXISTS: { code: "SLUG_TAKEN", field: "slug" },
  ORGANIZATION_NOT_FOUND: { code: "ORGANIZATION_NOT_FOUND" },
  NO_ACTIVE_ORGANIZATION: { code: "NO_ACTIVE_ORGANIZATION" },
  MEMBER_NOT_FOUND: { code: "MEMBER_NOT_FOUND" },
  USER_IS_NOT_A_MEMBER_OF_THE_ORGANIZATION: { code: "MEMBER_NOT_FOUND" },
  YOU_ARE_NOT_A_MEMBER_OF_THIS_ORGANIZATION: { code: "MEMBER_NOT_FOUND" },
  USER_IS_ALREADY_A_MEMBER_OF_THIS_ORGANIZATION: {
    code: "ALREADY_A_MEMBER",
    field: "email",
  },
  USER_IS_ALREADY_INVITED_TO_THIS_ORGANIZATION: {
    code: "ALREADY_INVITED",
    field: "email",
  },
  INVITATION_NOT_FOUND: { code: "INVITATION_NOT_FOUND" },
  FAILED_TO_RETRIEVE_INVITATION: { code: "INVITATION_NOT_FOUND" },
  INVITER_IS_NO_LONGER_A_MEMBER_OF_THE_ORGANIZATION: {
    code: "INVITATION_NOT_FOUND",
  },
  YOU_ARE_NOT_THE_RECIPIENT_OF_THE_INVITATION: { code: "WRONG_RECIPIENT" },
  INVITATION_LIMIT_REACHED: { code: "INVITATION_LIMIT_REACHED" },
  ORGANIZATION_MEMBERSHIP_LIMIT_REACHED: { code: "MEMBERSHIP_LIMIT_REACHED" },
  YOU_CANNOT_LEAVE_THE_ORGANIZATION_AS_THE_ONLY_OWNER: { code: "LAST_OWNER" },
  YOU_CANNOT_LEAVE_THE_ORGANIZATION_WITHOUT_AN_OWNER: { code: "LAST_OWNER" },
  EMAIL_VERIFICATION_REQUIRED_BEFORE_ACCEPTING_OR_REJECTING_INVITATION: {
    code: "EMAIL_VERIFICATION_REQUIRED",
  },
  EMAIL_VERIFICATION_REQUIRED_FOR_INVITATION: {
    code: "EMAIL_VERIFICATION_REQUIRED",
  },
}

function toFailure(error: unknown): Failure {
  if (isAPIError(error)) {
    const body = error.body as { code?: string; message?: string } | undefined
    const mapped = body?.code ? ERROR_CODE_MAP[body.code] : undefined

    if (mapped) {
      return failure(mapped.code, { field: mapped.field })
    }

    if (body?.code?.startsWith("YOU_ARE_NOT_ALLOWED")) {
      return failure("FORBIDDEN")
    }

    if (error.statusCode === 401) {
      return failure("UNAUTHORIZED")
    }

    if (error.statusCode === 403) {
      return failure("FORBIDDEN")
    }

    return failure("UNKNOWN_ERROR", { message: body?.message })
  }

  console.error("Unexpected organization action failure", error)

  return failure("UNKNOWN_ERROR")
}

type OrganizationContext = {
  userId: string
  organizationId: string
  memberId: string
  role: string
}


async function resolveContext(): Promise<
  { context: OrganizationContext; error: null } | Failure
> {
  const session = await getSession()

  if (!session) {
    return failure("UNAUTHORIZED")
  }

  const organizationId = session.session.activeOrganizationId

  if (!organizationId) {
    return failure("NO_ACTIVE_ORGANIZATION")
  }

  const membership = await findMembership(session.user.id, organizationId)

  if (!membership) {
    return failure("MEMBER_NOT_FOUND")
  }

  return {
    context: {
      userId: session.user.id,
      organizationId,
      memberId: membership.id,
      role: membership.role,
    },
    error: null,
  }
}


function revalidateOrganization(): void {
  revalidatePath("/", "layout")
}

export async function updateOrganizationAction(
  input: UpdateOrganizationInput
): Promise<OrganizationActionResult<{ id: string; slug: string }>> {
  const resolved = await resolveContext()

  if (resolved.error) {
    return resolved
  }

  const parsed = updateOrganizationSchema.safeParse(input)

  if (!parsed.success) {
    return validationFailure(parsed.error)
  }

  try {
    const updated = await auth.api.updateOrganization({
      headers: await headers(),
      body: {
        organizationId: resolved.context.organizationId,
        data: {
          name: parsed.data.name,
          slug: parsed.data.slug,
          logo: parsed.data.logo === "" ? null : parsed.data.logo,
        },
      },
    })

    if (!updated) {
      return failure("ORGANIZATION_NOT_FOUND")
    }

    revalidateOrganization()

    return { data: { id: updated.id, slug: updated.slug }, error: null }
  } catch (error) {
    return toFailure(error)
  }
}

export async function deleteOrganizationAction(): Promise<
  OrganizationActionResult<{ id: string }>
> {
  const resolved = await resolveContext()

  if (resolved.error) {
    return resolved
  }

  try {
    await auth.api.deleteOrganization({
      headers: await headers(),
      body: { organizationId: resolved.context.organizationId },
    })

    revalidateOrganization()

    return { data: { id: resolved.context.organizationId }, error: null }
  } catch (error) {
    return toFailure(error)
  }
}

export async function inviteMemberAction(
  input: InviteMemberInput
): Promise<OrganizationActionResult<{ id: string; email: string }>> {
  const resolved = await resolveContext()

  if (resolved.error) {
    return resolved
  }

  const parsed = inviteMemberSchema.safeParse(input)

  if (!parsed.success) {
    return validationFailure(parsed.error)
  }

  try {
    const invitation = await auth.api.createInvitation({
      headers: await headers(),
      body: {
        organizationId: resolved.context.organizationId,
        email: parsed.data.email,
        role: parsed.data.role,
      },
    })

    revalidateOrganization()

    return {
      data: { id: invitation.id, email: invitation.email },
      error: null,
    }
  } catch (error) {
    return toFailure(error)
  }
}

/**
 * `cancelPendingInvitationsOnReInvite` is on, so re-inviting the same address
 * supersedes the old invitation and sends a fresh email.
 */
export async function resendInvitationAction(
  input: InviteMemberInput
): Promise<OrganizationActionResult<{ id: string; email: string }>> {
  const resolved = await resolveContext()

  if (resolved.error) {
    return resolved
  }

  const parsed = inviteMemberSchema.safeParse(input)

  if (!parsed.success) {
    return validationFailure(parsed.error)
  }

  try {
    const invitation = await auth.api.createInvitation({
      headers: await headers(),
      body: {
        organizationId: resolved.context.organizationId,
        email: parsed.data.email,
        role: parsed.data.role,
        resend: true,
      },
    })

    revalidateOrganization()

    return {
      data: { id: invitation.id, email: invitation.email },
      error: null,
    }
  } catch (error) {
    return toFailure(error)
  }
}

export async function cancelInvitationAction(input: {
  invitationId: string
}): Promise<OrganizationActionResult<{ id: string }>> {
  const resolved = await resolveContext()

  if (resolved.error) {
    return resolved
  }

  const parsed = invitationActionSchema.safeParse(input)

  if (!parsed.success) {
    return failure("INVITATION_NOT_FOUND")
  }

  try {
    await auth.api.cancelInvitation({
      headers: await headers(),
      body: { invitationId: parsed.data.invitationId },
    })

    revalidateOrganization()

    return { data: { id: parsed.data.invitationId }, error: null }
  } catch (error) {
    return toFailure(error)
  }
}

export async function updateMemberRoleAction(
  input: UpdateMemberRoleInput
): Promise<OrganizationActionResult<{ id: string; role: string }>> {
  const resolved = await resolveContext()

  if (resolved.error) {
    return resolved
  }

  const parsed = updateMemberRoleSchema.safeParse(input)

  if (!parsed.success) {
    return validationFailure(parsed.error)
  }

  if (parsed.data.memberId === resolved.context.memberId) {
    return failure("FORBIDDEN", {
      message: "You can't change your own role.",
    })
  }

  try {
    const updated = await auth.api.updateMemberRole({
      headers: await headers(),
      body: {
        organizationId: resolved.context.organizationId,
        memberId: parsed.data.memberId,
        role: parsed.data.role,
      },
    })

    revalidateOrganization()

    return { data: { id: updated.id, role: updated.role }, error: null }
  } catch (error) {
    return toFailure(error)
  }
}

/**
 * Two steps on purpose: Better Auth lets an organization hold several owners,
 * so a transfer is "promote them, then step down" — and the promotion has to
 * land first or the last-owner guard would block the demotion.
 */
export async function transferOwnershipAction(input: {
  memberId: string
}): Promise<OrganizationActionResult<{ id: string }>> {
  const resolved = await resolveContext()

  if (resolved.error) {
    return resolved
  }

  const parsed = memberActionSchema.safeParse(input)

  if (!parsed.success) {
    return failure("MEMBER_NOT_FOUND")
  }

  if (primaryRole(resolved.context.role) !== "owner") {
    return failure("FORBIDDEN")
  }

  if (parsed.data.memberId === resolved.context.memberId) {
    return failure("FORBIDDEN", { message: "You already own this workspace." })
  }

  const requestHeaders = await headers()

  try {
    await auth.api.updateMemberRole({
      headers: requestHeaders,
      body: {
        organizationId: resolved.context.organizationId,
        memberId: parsed.data.memberId,
        role: "owner",
      },
    })
  } catch (error) {
    return toFailure(error)
  }

  try {
    await auth.api.updateMemberRole({
      headers: requestHeaders,
      body: {
        organizationId: resolved.context.organizationId,
        memberId: resolved.context.memberId,
        role: "admin",
      },
    })
  } catch (error) {
    // The new owner is already in place, so the workspace is safe — the old
    // owner just kept their role. Report it rather than silently succeeding.
    revalidateOrganization()
    console.error("Ownership transfer left two owners in place", error)

    return failure("UNKNOWN_ERROR", {
      message:
        "Ownership was transferred, but we couldn't change your own role. Update it from the members list.",
    })
  }

  revalidateOrganization()

  return { data: { id: parsed.data.memberId }, error: null }
}

export async function removeMemberAction(input: {
  memberId: string
}): Promise<OrganizationActionResult<{ id: string }>> {
  const resolved = await resolveContext()

  if (resolved.error) {
    return resolved
  }

  const parsed = memberActionSchema.safeParse(input)

  if (!parsed.success) {
    return failure("MEMBER_NOT_FOUND")
  }

  if (parsed.data.memberId === resolved.context.memberId) {
    return failure("FORBIDDEN", {
      message: "Use “Leave organization” to remove yourself.",
    })
  }

  try {
    await auth.api.removeMember({
      headers: await headers(),
      body: {
        organizationId: resolved.context.organizationId,
        memberIdOrEmail: parsed.data.memberId,
      },
    })

    revalidateOrganization()

    return { data: { id: parsed.data.memberId }, error: null }
  } catch (error) {
    return toFailure(error)
  }
}

export async function leaveOrganizationAction(): Promise<
  OrganizationActionResult<{ id: string }>
> {
  const resolved = await resolveContext()

  if (resolved.error) {
    return resolved
  }

  try {
    await auth.api.leaveOrganization({
      headers: await headers(),
      body: { organizationId: resolved.context.organizationId },
    })

    revalidateOrganization()

    return { data: { id: resolved.context.organizationId }, error: null }
  } catch (error) {
    return toFailure(error)
  }
}

export async function acceptInvitationAction(input: {
  invitationId: string
}): Promise<OrganizationActionResult<{ organizationId: string }>> {
  const session = await getSession()

  if (!session) {
    return failure("UNAUTHORIZED")
  }

  const parsed = invitationActionSchema.safeParse(input)

  if (!parsed.success) {
    return failure("INVITATION_NOT_FOUND")
  }

  try {
    const accepted = await auth.api.acceptInvitation({
      headers: await headers(),
      body: { invitationId: parsed.data.invitationId },
    })

    revalidateOrganization()

    // Accepting also makes the organization active, so the app shell that
    // renders next is already scoped to it.
    return {
      data: { organizationId: accepted?.invitation.organizationId ?? "" },
      error: null,
    }
  } catch (error) {
    return toFailure(error)
  }
}

export async function rejectInvitationAction(input: {
  invitationId: string
}): Promise<OrganizationActionResult<{ id: string }>> {
  const session = await getSession()

  if (!session) {
    return failure("UNAUTHORIZED")
  }

  const parsed = invitationActionSchema.safeParse(input)

  if (!parsed.success) {
    return failure("INVITATION_NOT_FOUND")
  }

  try {
    await auth.api.rejectInvitation({
      headers: await headers(),
      body: { invitationId: parsed.data.invitationId },
    })

    revalidateOrganization()

    return { data: { id: parsed.data.invitationId }, error: null }
  } catch (error) {
    return toFailure(error)
  }
}

