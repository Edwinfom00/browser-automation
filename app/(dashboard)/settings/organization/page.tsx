import type { Metadata } from "next"

import { getOrganizationManageData } from "@/modules/organizations/server/organizations"
import { OrganizationSettingsView } from "@/modules/organizations/ui/views/organization-settings-view"

export const metadata: Metadata = {
  title: "Organization settings · Browser Automation",
  description: "Rename your organization, change its slug, or delete it.",
  robots: { index: false, follow: false },
}

export default async function OrganizationSettingsPage() {
  const { organization, viewer } = await getOrganizationManageData()

  return <OrganizationSettingsView organization={organization} viewer={viewer} />
}
