import type { Metadata } from "next"

import { requireSession } from "@/modules/auth/server/session"
import { listUserOrganizations } from "@/modules/organizations/server/organizations"
import { OrganizationSelectView } from "@/modules/organizations/ui/views/organization-select-view"

export const metadata: Metadata = {
  title: "Choose an organization · Browser Automation",
  description: "Select the workspace you want to continue in.",
  robots: { index: false, follow: false },
}

export default async function OrganizationsPage() {
  const session = await requireSession()
  const organizations = await listUserOrganizations(session.user.id)

  return (
    <OrganizationSelectView
      user={session.user}
      organizations={organizations}
      activeOrganizationId={session.session.activeOrganizationId}
    />
  )
}
