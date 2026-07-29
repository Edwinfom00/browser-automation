"use client"

import { formatDistanceToNow } from "date-fns"
import { LuLoaderCircle, LuTriangleAlert } from "react-icons/lu"

import { Button } from "@/components/ui/button"
import { roleDescription, roleLabel } from "@/modules/organizations/lib/roles"
import type { IncomingInvitation } from "@/modules/organizations/types"
import { useInvitationResponse } from "@/modules/organizations/hooks/use-invitation-response"
import { OrganizationLogo } from "@/modules/organizations/ui/components/organization-logo"

export function AcceptInvitationCard({
  invitation,
}: {
  invitation: IncomingInvitation
}) {
  const { accept, reject, pendingFor, isPending, error } =
    useInvitationResponse()

  const pending = pendingFor(invitation.id)

  return (
    <div className="flex w-full max-w-md flex-col gap-8">
      <div className="flex flex-col items-center gap-5 text-center">
        <OrganizationLogo
          id={invitation.organizationId}
          name={invitation.organizationName}
          logo={invitation.organizationLogo}
          size="lg"
        />

        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Join {invitation.organizationName}
          </h1>
          <p className="text-muted-foreground">
            {invitation.inviterName || invitation.inviterEmail} invited you as{" "}
            <span className="font-medium text-foreground">
              {roleLabel(invitation.role).toLowerCase()}
            </span>
            .
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border p-5 text-sm">
        <div className="flex items-start justify-between gap-4">
          <span className="text-muted-foreground">Your role</span>
          <span className="text-right font-medium">
            {roleLabel(invitation.role)}
          </span>
        </div>
        <p className="text-muted-foreground">{roleDescription(invitation.role)}</p>

        <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
          <span className="text-muted-foreground">Expires</span>
          <span className="font-medium">
            {formatDistanceToNow(invitation.expiresAt, { addSuffix: true })}
          </span>
        </div>
      </div>

      {error ? (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
        >
          <LuTriangleAlert className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        <Button
          disabled={isPending}
          onClick={() => void accept(invitation.id)}
          className="h-12 w-full rounded-lg bg-violet-600 text-base font-semibold text-white hover:bg-violet-500"
        >
          {pending === "accept" ? (
            <LuLoaderCircle className="size-4.5 animate-spin" />
          ) : null}
          Accept invitation
        </Button>

        <Button
          variant="ghost"
          disabled={isPending}
          onClick={() => void reject(invitation.id)}
          className="h-11 w-full text-muted-foreground"
        >
          {pending === "reject" ? (
            <LuLoaderCircle className="size-4 animate-spin" />
          ) : null}
          Decline
        </Button>
      </div>
    </div>
  )
}
