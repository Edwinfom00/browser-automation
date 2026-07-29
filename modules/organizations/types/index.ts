import type { z } from "zod"

import type { Invitation, Member, User } from "@/lib/db/schema"
import type { FieldErrors } from "@/modules/auth/types"
import type {
  ASSIGNABLE_ORGANIZATION_ROLES,
  ORGANIZATION_ERROR_MESSAGES,
  ORGANIZATION_ROLES,
} from "@/modules/organizations/constants"
import type {
  createOrganizationSchema,
  inviteMemberSchema,
  selectOrganizationSchema,
  updateMemberRoleSchema,
  updateOrganizationSchema,
} from "@/modules/organizations/validators"

export type OrganizationRole = (typeof ORGANIZATION_ROLES)[number]

export type AssignableOrganizationRole =
  (typeof ASSIGNABLE_ORGANIZATION_ROLES)[number]

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>

export type SelectOrganizationInput = z.infer<typeof selectOrganizationSchema>

export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>

export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>

export type CreateOrganizationFieldErrors = FieldErrors<CreateOrganizationInput>

export type UpdateOrganizationFieldErrors = FieldErrors<UpdateOrganizationInput>

export type InviteMemberFieldErrors = FieldErrors<InviteMemberInput>


export type OrganizationSummary = {
  id: string
  name: string
  slug: string
  logo: string | null
  role: string
  memberCount: number
}


export type OrganizationSwitcherData = {
  organizations: OrganizationSummary[]
  activeOrganizationId: string | null
}

export type OrganizationMember = Pick<Member, "id" | "role" | "createdAt"> & {
  user: Pick<User, "id" | "name" | "email" | "image">
}

export type OrganizationInvitation = Pick<
  Invitation,
  "id" | "email" | "role" | "status" | "expiresAt" | "createdAt"
> & {
  inviter: Pick<User, "id" | "name" | "email">
}


export type IncomingInvitation = Pick<
  Invitation,
  "id" | "email" | "role" | "expiresAt"
> & {
  organizationId: string
  organizationName: string
  organizationSlug: string
  organizationLogo: string | null
  inviterName: string
  inviterEmail: string
}


export type OrganizationViewer = {
  memberId: string
  userId: string
  role: OrganizationRole
  canUpdateOrganization: boolean
  canDeleteOrganization: boolean
  canManageMembers: boolean
  canInviteMembers: boolean
  canTransferOwnership: boolean
  canLeave: boolean
}

export type OrganizationManageData = {
  organization: OrganizationSummary
  viewer: OrganizationViewer
  members: OrganizationMember[]
  invitations: OrganizationInvitation[]
  ownerCount: number
}

export type OrganizationErrorCode = keyof typeof ORGANIZATION_ERROR_MESSAGES

export type OrganizationActionError = {
  code: OrganizationErrorCode
  message: string
  field?: string
}

export type OrganizationActionResult<TData = null> =
  | { data: TData; error: null }
  | { data: null; error: OrganizationActionError }
