import type { Metadata } from "next"

import { getOrganizationManageData } from "@/modules/organizations/server/organizations"
import { OrganizationMembersView } from "@/modules/organizations/ui/views/organization-members-view"

export const metadata: Metadata = {
  title: "Members · Browser Automation",
  description: "Invite teammates and manage their roles.",
  robots: { index: false, follow: false },
}

export default async function OrganizationMembersPage() {
  const { members, invitations, inviteCode, viewer } =
    await getOrganizationManageData()

  return (
    <OrganizationMembersView
      members={members}
      invitations={invitations}
      inviteCode={viewer.canInviteMembers ? inviteCode : null}
      viewer={viewer}
    />
  )
}
