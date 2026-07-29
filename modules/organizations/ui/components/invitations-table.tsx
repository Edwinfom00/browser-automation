"use client"

import { formatDistanceToNow } from "date-fns"
import {
  LuLoaderCircle,
  LuMail,
  LuSend,
  LuTriangleAlert,
  LuX,
} from "react-icons/lu"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useInvitationActions } from "@/modules/organizations/hooks/use-organization-invitations"
import { primaryRole } from "@/modules/organizations/lib/roles"
import type {
  AssignableOrganizationRole,
  OrganizationInvitation,
} from "@/modules/organizations/types"
import { RoleBadge } from "@/modules/organizations/ui/components/role-badge"


function assignableRole(role: string | null): AssignableOrganizationRole {
  return primaryRole(role) === "admin" ? "admin" : "member"
}

export function InvitationsTable({
  invitations,
  canManage,
}: {
  invitations: OrganizationInvitation[]
  canManage: boolean
}) {
  const { cancel, resend, pendingId, isPending, error } = useInvitationActions()

  if (invitations.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-10 text-center">
        <span
          aria-hidden
          className="grid size-11 place-items-center rounded-xl bg-muted text-muted-foreground [&_svg]:size-5"
        >
          <LuMail />
        </span>

        <div className="space-y-1">
          <p className="text-sm font-medium">No pending invitations</p>
          <p className="text-sm text-muted-foreground">
            Invitations show up here until they&apos;re accepted or they expire.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {error ? (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
        >
          <LuTriangleAlert className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invited</TableHead>
              <TableHead className="hidden sm:table-cell">Expires</TableHead>
              <TableHead className="text-right">Role</TableHead>
              {canManage ? <TableHead className="w-24" /> : null}
            </TableRow>
          </TableHeader>

          <TableBody>
            {invitations.map((invitation) => {
              const isRowPending = pendingId === invitation.id

              return (
                <TableRow key={invitation.id}>
                  <TableCell>
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium">
                        {invitation.email}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        by {invitation.inviter.name || invitation.inviter.email}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="hidden text-sm whitespace-nowrap text-muted-foreground sm:table-cell">
                    {formatDistanceToNow(invitation.expiresAt, {
                      addSuffix: true,
                    })}
                  </TableCell>

                  <TableCell className="text-right">
                    <RoleBadge role={invitation.role} />
                  </TableCell>

                  {canManage ? (
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {isRowPending ? (
                          <LuLoaderCircle className="size-4 animate-spin text-muted-foreground" />
                        ) : null}

                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isPending}
                          title="Resend invitation"
                          aria-label={`Resend the invitation to ${invitation.email}`}
                          className="size-8 text-muted-foreground"
                          onClick={() =>
                            void resend({
                              id: invitation.id,
                              email: invitation.email,
                              role: assignableRole(invitation.role),
                            })
                          }
                        >
                          <LuSend />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isPending}
                          title="Cancel invitation"
                          aria-label={`Cancel the invitation to ${invitation.email}`}
                          className="size-8 text-muted-foreground hover:text-destructive"
                          onClick={() => void cancel(invitation.id)}
                        >
                          <LuX />
                        </Button>
                      </div>
                    </TableCell>
                  ) : null}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
