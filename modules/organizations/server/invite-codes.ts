import { and, desc, eq, gt, isNull } from "drizzle-orm"

import { db } from "@/lib/db"
import { organizationInviteCodes } from "@/lib/db/schema"
import type { ActiveInviteCode } from "@/modules/organizations/types"

const ACTIVE_COLUMNS = {
  id: organizationInviteCodes.id,
  code: organizationInviteCodes.code,
  role: organizationInviteCodes.role,
  expiresAt: organizationInviteCodes.expiresAt,
  usedCount: organizationInviteCodes.usedCount,
  createdAt: organizationInviteCodes.createdAt,
}


export async function getActiveInviteCode(
  organizationId: string
): Promise<ActiveInviteCode | null> {
  const [row] = await db
    .select(ACTIVE_COLUMNS)
    .from(organizationInviteCodes)
    .where(
      and(
        eq(organizationInviteCodes.organizationId, organizationId),
        isNull(organizationInviteCodes.revokedAt),
        gt(organizationInviteCodes.expiresAt, new Date())
      )
    )
    .orderBy(desc(organizationInviteCodes.createdAt))
    .limit(1)

  return row ?? null
}


export async function findRedeemableInviteCode(code: string): Promise<{
  id: string
  organizationId: string
  role: string
} | null> {
  const [row] = await db
    .select({
      id: organizationInviteCodes.id,
      organizationId: organizationInviteCodes.organizationId,
      role: organizationInviteCodes.role,
    })
    .from(organizationInviteCodes)
    .where(
      and(
        eq(organizationInviteCodes.code, code),
        isNull(organizationInviteCodes.revokedAt),
        gt(organizationInviteCodes.expiresAt, new Date())
      )
    )
    .limit(1)

  return row ?? null
}
