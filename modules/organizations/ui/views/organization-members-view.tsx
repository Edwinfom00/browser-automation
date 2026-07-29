import { ORGANIZATION_MEMBERSHIP_LIMIT } from "@/modules/organizations/constants"
import type { OrganizationManageData } from "@/modules/organizations/types"
import { InvitationsTable } from "@/modules/organizations/ui/components/invitations-table"
import { InviteMemberDialog } from "@/modules/organizations/ui/components/invite-member-dialog"
import { MembersTable } from "@/modules/organizations/ui/components/members-table"

export function OrganizationMembersView({
  members,
  invitations,
  inviteCode,
  viewer,
}: Pick<
  OrganizationManageData,
  "members" | "invitations" | "inviteCode" | "viewer"
>) {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-medium">
              Members{" "}
              <span className="text-muted-foreground">
                / {members.length} of {ORGANIZATION_MEMBERSHIP_LIMIT}
              </span>
            </h2>
            <p className="text-sm text-muted-foreground">
              Admins manage people and settings. Members build and run
              workflows.
            </p>
          </div>

          {viewer.canInviteMembers ? (
            <InviteMemberDialog inviteCode={inviteCode} />
          ) : null}
        </div>

        <MembersTable members={members} viewer={viewer} />
      </section>

      <section className="flex flex-col gap-5">
        <div className="space-y-1">
          <h2 className="text-lg font-medium">
            Pending invitations{" "}
            <span className="text-muted-foreground">
              / {invitations.length}
            </span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Invitations expire seven days after they&apos;re sent.
          </p>
        </div>

        <InvitationsTable
          invitations={invitations}
          canManage={viewer.canInviteMembers}
        />
      </section>
    </div>
  )
}
