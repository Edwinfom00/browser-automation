import { z } from "zod"

import {
  ASSIGNABLE_ORGANIZATION_ROLES,
  INVITE_CODE_LENGTH,
  ORGANIZATION_NAME_MAX_LENGTH,
  ORGANIZATION_NAME_MIN_LENGTH,
  ORGANIZATION_ROLES,
  ORGANIZATION_SLUG_MAX_LENGTH,
  ORGANIZATION_SLUG_MIN_LENGTH,
} from "@/modules/organizations/constants"


export const organizationSlugSchema = z
  .string()
  .trim()
  .min(ORGANIZATION_SLUG_MIN_LENGTH, "Slugs need at least 3 characters")
  .max(
    ORGANIZATION_SLUG_MAX_LENGTH,
    `Keep the slug under ${ORGANIZATION_SLUG_MAX_LENGTH} characters`
  )
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lowercase letters, numbers and single hyphens"
  )

export const organizationNameSchema = z
  .string()
  .trim()
  .min(ORGANIZATION_NAME_MIN_LENGTH, "Give your organization a name")
  .max(
    ORGANIZATION_NAME_MAX_LENGTH,
    `Keep the name under ${ORGANIZATION_NAME_MAX_LENGTH} characters`
  )

export const createOrganizationSchema = z.object({
  name: organizationNameSchema,
  slug: organizationSlugSchema,
})

export const selectOrganizationSchema = z.object({
  organizationId: z.string().min(1, "Pick an organization to continue"),
})


export const organizationLogoSchema = z.union([
  z.literal(""),
  z.url("Enter a valid image URL").max(2048, "That URL is too long"),
])

export const updateOrganizationSchema = z.object({
  name: organizationNameSchema,
  slug: organizationSlugSchema,
  logo: organizationLogoSchema,
})

export const organizationRoleSchema = z.enum(ORGANIZATION_ROLES)

export const assignableRoleSchema = z.enum(ASSIGNABLE_ORGANIZATION_ROLES, {
  message: "Pick a role",
})

export const memberIdSchema = z.string().min(1, "Pick a member")

export const invitationIdSchema = z.string().min(1, "Invitation not found")

export const inviteMemberSchema = z.object({
  email: z.email("Enter a valid email address").trim().toLowerCase(),
  role: assignableRoleSchema,
})

export const inviteCodeSchema = z
  .string()
  .trim()
  .regex(
    new RegExp(`^\\d{${INVITE_CODE_LENGTH}}$`),
    `Enter the ${INVITE_CODE_LENGTH}-digit code`
  )

export const createInviteCodeSchema = z.object({
  role: assignableRoleSchema,
})

export const joinWithCodeSchema = z.object({
  code: inviteCodeSchema,
})

export const updateMemberRoleSchema = z.object({
  memberId: memberIdSchema,
  role: assignableRoleSchema,
})

export const memberActionSchema = z.object({
  memberId: memberIdSchema,
})

export const invitationActionSchema = z.object({
  invitationId: invitationIdSchema,
})
