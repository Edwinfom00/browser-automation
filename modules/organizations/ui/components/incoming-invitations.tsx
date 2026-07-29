"use client"

import { LuLoaderCircle, LuTriangleAlert } from "react-icons/lu"

import { Button } from "@/components/ui/button"
import { useInvitationResponse } from "@/modules/organizations/hooks/use-invitation-response"
import { roleLabel } from "@/modules/organizations/lib/roles"
import type { IncomingInvitation } from "@/modules/organizations/types"
import { OrganizationLogo } from "@/modules/organizations/ui/components/organization-logo"


export function IncomingInvitations({
  invitations,
}: {
  invitations: IncomingInvitation[]
}) {
  const { accept, reject, pendingFor, isPending, error } =
    useInvitationResponse()

  if (invitations.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
        Invitations / {String(invitations.length).padStart(2, "0")}
      </p>

      {error ? (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
        >
          <LuTriangleAlert className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <ul className="flex flex-col gap-3">
        {invitations.map((invitation) => (
          <li
            key={invitation.id}
            className="flex flex-wrap items-center gap-4 rounded-xl border border-violet-500/40 bg-violet-500/[0.05] px-4 py-3.5"
          >
            <OrganizationLogo
              id={invitation.organizationId}
              name={invitation.organizationName}
              logo={invitation.organizationLogo}
            />

            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-medium">
                {invitation.organizationName}
              </span>
              <span className="truncate text-sm text-muted-foreground">
                {invitation.inviterName || invitation.inviterEmail} invited you
                as {roleLabel(invitation.role).toLowerCase()}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={isPending}
                className="text-muted-foreground"
                onClick={() => void reject(invitation.id)}
              >
                {pendingFor(invitation.id) === "reject" ? (
                  <LuLoaderCircle className="size-4 animate-spin" />
                ) : null}
                Decline
              </Button>

              <Button
                size="sm"
                disabled={isPending}
                className="bg-violet-600 text-white hover:bg-violet-500"
                onClick={() => void accept(invitation.id)}
              >
                {pendingFor(invitation.id) === "accept" ? (
                  <LuLoaderCircle className="size-4 animate-spin" />
                ) : null}
                Accept
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
