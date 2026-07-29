"use server"

import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import { getSession } from "@/modules/auth/server/session"
import { primaryRole } from "@/modules/organizations/lib/roles"
import {
  failure,
  resolveContext,
  revalidateOrganization,
  toFailure,
  validationFailure,
} from "@/modules/organizations/server/context"
import type {
  InviteMemberInput,
  OrganizationActionResult,
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
      message: "Use â€œLeave organizationâ€ to remove yourself.",
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

