import type { Metadata } from "next"

import { requireSession } from "@/modules/auth/server/session"
import {
  listIncomingInvitations,
  listUserOrganizations,
} from "@/modules/organizations/server/organizations"
import { OrganizationSelectView } from "@/modules/organizations/ui/views/organization-select-view"

export const metadata: Metadata = {
  title: "Choose an organization · Browser Automation",
  description: "Select the workspace you want to continue in.",
  robots: { index: false, follow: false },
}

export default async function OrganizationsPage() {
  const session = await requireSession()

  const [organizations, invitations] = await Promise.all([
    listUserOrganizations(session.user.id),
    listIncomingInvitations(session.user.email),
  ])

  return (
    <OrganizationSelectView
      user={session.user}
      organizations={organizations}
      invitations={invitations}
      activeOrganizationId={session.session.activeOrganizationId}
    />
  )
}
