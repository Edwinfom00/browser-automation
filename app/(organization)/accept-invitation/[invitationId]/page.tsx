import type { Metadata } from "next"

import { AUTH_ROUTES } from "@/modules/auth/constants"
import { requireSession } from "@/modules/auth/server/session"
import { acceptInvitationRoute } from "@/modules/organizations/constants"
import { getInvitationForRecipient } from "@/modules/organizations/server/organizations"
import { AcceptInvitationView } from "@/modules/organizations/ui/views/accept-invitation-view"

export const metadata: Metadata = {
  title: "Join an organization · Browser Automation",
  description: "Review and accept your invitation.",
  robots: { index: false, follow: false },
}

export default async function AcceptInvitationPage({
  params,
}: {
  params: Promise<{ invitationId: string }>
}) {
  const { invitationId } = await params

 
  const session = await requireSession(
    `${AUTH_ROUTES.login}?redirectTo=${encodeURIComponent(acceptInvitationRoute(invitationId))}`
  )

  const invitation = await getInvitationForRecipient(
    invitationId,
    session.user.email
  )

  return <AcceptInvitationView user={session.user} invitation={invitation} />
}
