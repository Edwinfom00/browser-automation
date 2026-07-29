"use server"

import { headers } from "next/headers"
import { and, eq, isNull, sql } from "drizzle-orm"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { organizationInviteCodes } from "@/lib/db/schema"
import { getSession } from "@/modules/auth/server/session"
import {
  INVITE_CODE_ATTEMPT_WINDOW_MS,
  INVITE_CODE_EXPIRES_IN_DAYS,
  INVITE_CODE_MAX_ATTEMPTS,
} from "@/modules/organizations/constants"
import { generateInviteCode } from "@/modules/organizations/lib/invite-code"
import {
  failure,
  resolveContext,
  revalidateOrganization,
  toFailure,
  validationFailure,
} from "@/modules/organizations/server/context"
import { findRedeemableInviteCode } from "@/modules/organizations/server/invite-codes"
import {
  findMembership,
  roleCan,
} from "@/modules/organizations/server/organizations"
import type {
  ActiveInviteCode,
  CreateInviteCodeInput,
  JoinWithCodeInput,
  OrganizationActionResult,
} from "@/modules/organizations/types"
import {
  createInviteCodeSchema,
  joinWithCodeSchema,
} from "@/modules/organizations/validators"

const UNIQUE_VIOLATION = "23505"

const GENERATION_ATTEMPTS = 8

function expiryDate(): Date {
  return new Date(
    Date.now() + INVITE_CODE_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000
  )
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === UNIQUE_VIOLATION
  )
}


const attempts = new Map<string, { count: number; resetAt: number }>()

function registerAttempt(userId: string): boolean {
  const now = Date.now()
  const current = attempts.get(userId)

  if (!current || current.resetAt <= now) {
    attempts.set(userId, {
      count: 1,
      resetAt: now + INVITE_CODE_ATTEMPT_WINDOW_MS,
    })
    return true
  }

  if (current.count >= INVITE_CODE_MAX_ATTEMPTS) {
    return false
  }

  current.count += 1
  return true
}

function clearAttempts(userId: string): void {
  attempts.delete(userId)
}


export async function generateInviteCodeAction(
  input: CreateInviteCodeInput
): Promise<OrganizationActionResult<ActiveInviteCode>> {
  const resolved = await resolveContext()

  if (resolved.error) {
    return resolved
  }

  const parsed = createInviteCodeSchema.safeParse(input)

  if (!parsed.success) {
    return validationFailure(parsed.error)
  }

  if (!roleCan(resolved.context.role, { invitation: ["create"] })) {
    return failure("FORBIDDEN")
  }

  const { organizationId, userId } = resolved.context

  try {
    for (let attempt = 0; attempt < GENERATION_ATTEMPTS; attempt += 1) {
      try {
        const created = await db.transaction(async (tx) => {
          await tx
            .update(organizationInviteCodes)
            .set({ revokedAt: new Date() })
            .where(
              and(
                eq(organizationInviteCodes.organizationId, organizationId),
                isNull(organizationInviteCodes.revokedAt)
              )
            )

          const [row] = await tx
            .insert(organizationInviteCodes)
            .values({
              organizationId,
              code: generateInviteCode(),
              role: parsed.data.role,
              createdBy: userId,
              expiresAt: expiryDate(),
            })
            .returning({
              id: organizationInviteCodes.id,
              code: organizationInviteCodes.code,
              role: organizationInviteCodes.role,
              expiresAt: organizationInviteCodes.expiresAt,
              usedCount: organizationInviteCodes.usedCount,
              createdAt: organizationInviteCodes.createdAt,
            })

          return row
        })

        revalidateOrganization()

        return { data: created, error: null }
      } catch (error) {
        if (!isUniqueViolation(error)) {
          throw error
        }
      }
    }

    return failure("UNKNOWN_ERROR", {
      message: "We couldn't reserve a code. Try again.",
    })
  } catch (error) {
    return toFailure(error)
  }
}

export async function revokeInviteCodeAction(): Promise<
  OrganizationActionResult<{ organizationId: string }>
> {
  const resolved = await resolveContext()

  if (resolved.error) {
    return resolved
  }

  if (!roleCan(resolved.context.role, { invitation: ["cancel"] })) {
    return failure("FORBIDDEN")
  }

  try {
    await db
      .update(organizationInviteCodes)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(
            organizationInviteCodes.organizationId,
            resolved.context.organizationId
          ),
          isNull(organizationInviteCodes.revokedAt)
        )
      )

    revalidateOrganization()

    return {
      data: { organizationId: resolved.context.organizationId },
      error: null,
    }
  } catch (error) {
    return toFailure(error)
  }
}


export async function joinWithInviteCodeAction(
  input: JoinWithCodeInput
): Promise<
  OrganizationActionResult<{ organizationId: string; alreadyMember: boolean }>
> {
  const session = await getSession()

  if (!session) {
    return failure("UNAUTHORIZED")
  }

  if (!session.user.emailVerified) {
    return failure("EMAIL_VERIFICATION_REQUIRED")
  }

  const parsed = joinWithCodeSchema.safeParse(input)

  if (!parsed.success) {
    return validationFailure(parsed.error)
  }

  if (!registerAttempt(session.user.id)) {
    return failure("TOO_MANY_CODE_ATTEMPTS", { field: "code" })
  }

  const inviteCode = await findRedeemableInviteCode(parsed.data.code)

  if (!inviteCode) {
    return failure("INVITE_CODE_NOT_FOUND", { field: "code" })
  }

  clearAttempts(session.user.id)

  const requestHeaders = await headers()

  const existing = await findMembership(
    session.user.id,
    inviteCode.organizationId
  )

  try {
    if (!existing) {
      await auth.api.addMember({
        body: {
          userId: session.user.id,
          organizationId: inviteCode.organizationId,
          role: inviteCode.role as "admin" | "member",
        },
      })

      await db
        .update(organizationInviteCodes)
        .set({ usedCount: sql`${organizationInviteCodes.usedCount} + 1` })
        .where(eq(organizationInviteCodes.id, inviteCode.id))
    }

    await auth.api.setActiveOrganization({
      headers: requestHeaders,
      body: { organizationId: inviteCode.organizationId },
    })

    revalidateOrganization()

    return {
      data: {
        organizationId: inviteCode.organizationId,
        alreadyMember: Boolean(existing),
      },
      error: null,
    }
  } catch (error) {
    return toFailure(error)
  }
}
