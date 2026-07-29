import { getLiveblocks } from "@/lib/liveblocks"
import { getSession } from "@/modules/auth/server/session"
import { findMembership } from "@/modules/organizations/server/organizations"

export async function POST(): Promise<Response> {
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

  const { status, body } = await getLiveblocks().identifyUser(
    {
      userId: session.user.id,
      groupIds: [organizationId],
    },
    {
      userInfo: {
        name: session.user.name || session.user.email,
        avatar: session.user.image ?? undefined,
      },
    }
  )

  return new Response(body, { status })
}
