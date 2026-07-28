import { z } from "zod"

import {
  ORGANIZATION_NAME_MAX_LENGTH,
  ORGANIZATION_NAME_MIN_LENGTH,
  ORGANIZATION_SLUG_MAX_LENGTH,
  ORGANIZATION_SLUG_MIN_LENGTH,
} from "@/modules/organizations/constants"

/** Lowercase words joined by single hyphens — what ends up in the workspace URL. */
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

export const createOrganizationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(ORGANIZATION_NAME_MIN_LENGTH, "Give your organization a name")
    .max(
      ORGANIZATION_NAME_MAX_LENGTH,
      `Keep the name under ${ORGANIZATION_NAME_MAX_LENGTH} characters`
    ),
  slug: organizationSlugSchema,
})

export const selectOrganizationSchema = z.object({
  organizationId: z.string().min(1, "Pick an organization to continue"),
})
