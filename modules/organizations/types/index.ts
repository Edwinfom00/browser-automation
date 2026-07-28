import type { z } from "zod"

import type { FieldErrors } from "@/modules/auth/types"
import type {
  createOrganizationSchema,
  selectOrganizationSchema,
} from "@/modules/organizations/validators"

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>

export type SelectOrganizationInput = z.infer<typeof selectOrganizationSchema>

export type CreateOrganizationFieldErrors = FieldErrors<CreateOrganizationInput>


export type OrganizationSummary = {
  id: string
  name: string
  slug: string
  logo: string | null
  role: string
  memberCount: number
}
