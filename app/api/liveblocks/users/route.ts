import { and, eq, inArray } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/lib/db"
import { member, user } from "@/lib/db/auth-schema"
import { getSession } from "@/modules/auth/server/session"
import { findMembership } from "@/modules/organizations/server/organizations"

/** Liveblocks batches `resolveUsers` calls, so keep a ceiling on the batch. */
const MAX_USER_IDS = 200

const resolveUsersSchema = z.object({
  userIds: z.array(z.string().min(1)).max(MAX_USER_IDS),
})

type ResolvedUser = { name: string; avatar?: string }

export async function POST(request: Request): Promise<Response> {
  const session = await getSession()

  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }

  const organizationId = session.session.activeOrganizationId

  if (!organizationId) {
    return new Response("No active organization", { status: 403 })
  }

  const membership = await findMembership(session.user.id, organizationId)

  if (!membership) {
    return new Response("Not a member of this organization", { status: 403 })
  }

  let payload: unknown

  try {
    payload = await request.json()
  } catch {
    return new Response("Invalid JSON body", { status: 400 })
  }

  const parsed = resolveUsersSchema.safeParse(payload)

  if (!parsed.success) {
    return new Response("Invalid user ids", { status: 400 })
  }

  const { userIds } = parsed.data

  if (userIds.length === 0) {
    return Response.json([])
  }

  // Only resolve members of the caller's organization, so ids from other
  // organizations come back as `null` rather than leaking user details.
  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
    })
    .from(member)
    .innerJoin(user, eq(member.userId, user.id))
    .where(
      and(
        eq(member.organizationId, organizationId),
        inArray(member.userId, [...new Set(userIds)])
      )
    )

  const usersById = new Map<string, ResolvedUser>(
    rows.map((row) => [
      row.id,
      { name: row.name || row.email, avatar: row.image ?? undefined },
    ])
  )

  // Same length and order as `userIds`, `null` for anyone we can't resolve.
  return Response.json(userIds.map((userId) => usersById.get(userId) ?? null))
}
