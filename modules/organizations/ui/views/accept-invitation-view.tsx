import Link from "next/link"
import { LuMailX } from "react-icons/lu"

import { Button } from "@/components/ui/button"
import type { AuthUser } from "@/modules/auth/types"
import { ORGANIZATION_ROUTES } from "@/modules/organizations/constants"
import type { IncomingInvitation } from "@/modules/organizations/types"
import { AcceptInvitationCard } from "@/modules/organizations/ui/components/accept-invitation-card"
import { OrganizationTopbar } from "@/modules/organizations/ui/components/organization-topbar"

/**
 * Rendered when the invitation is gone, expired, or addressed to a different
 * mailbox — all three look the same to the visitor on purpose.
 */
function InvitationUnavailable({ email }: { email: string }) {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
      <span
        aria-hidden
        className="grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground [&_svg]:size-7"
      >
        <LuMailX />
      </span>

      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          This invitation isn&apos;t available
        </h1>
        <p className="text-muted-foreground">
          It may have expired, been cancelled, or been sent to a different email
          address. You&apos;re signed in as {email}.
        </p>
      </div>

      <Button asChild className="h-12 w-full rounded-lg text-base font-semibold">
        <Link href={ORGANIZATION_ROUTES.select}>Go to your organizations</Link>
      </Button>
    </div>
  )
}

export function AcceptInvitationView({
  user,
  invitation,
}: {
  user: AuthUser
  invitation: IncomingInvitation | null
}) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <OrganizationTopbar user={user} />

      <main className="flex flex-1 items-center justify-center px-6 py-12 sm:px-12">
        {invitation ? (
          <AcceptInvitationCard invitation={invitation} />
        ) : (
          <InvitationUnavailable email={user.email} />
        )}
      </main>
    </div>
  )
}
