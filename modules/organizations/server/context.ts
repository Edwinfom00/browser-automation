import { revalidatePath } from "next/cache"
import { isAPIError } from "better-auth/api"

import { getSession } from "@/modules/auth/server/session"
import { ORGANIZATION_ERROR_MESSAGES } from "@/modules/organizations/constants"
import { findMembership } from "@/modules/organizations/server/organizations"
import type {
  OrganizationActionError,
  OrganizationErrorCode,
} from "@/modules/organizations/types"

export type Failure = { data: null; error: OrganizationActionError }

export function failure(
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

export function validationFailure(error: {
  issues: Array<{ message: string; path: PropertyKey[] }>
}): Failure {
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

export function toFailure(error: unknown): Failure {
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

export type OrganizationContext = {
  userId: string
  organizationId: string
  memberId: string
  role: string
}


export async function resolveContext(): Promise<
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


export function revalidateOrganization(): void {
  revalidatePath("/", "layout")
}
