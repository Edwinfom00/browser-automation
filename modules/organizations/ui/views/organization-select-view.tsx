import Link from "next/link"
import { LuBuilding2, LuHash, LuPlus } from "react-icons/lu"

import type { AuthUser } from "@/modules/auth/types"
import { ORGANIZATION_ROUTES } from "@/modules/organizations/constants"
import type {
  IncomingInvitation,
  OrganizationSummary,
} from "@/modules/organizations/types"
import { CreateOrganizationForm } from "@/modules/organizations/ui/components/create-organization-form"
import { IncomingInvitations } from "@/modules/organizations/ui/components/incoming-invitations"
import { OrganizationList } from "@/modules/organizations/ui/components/organization-list"
import { OrganizationTeamPreview } from "@/modules/organizations/ui/components/organization-team-preview"
import { OrganizationTopbar } from "@/modules/organizations/ui/components/organization-topbar"

function EmptyOrganizations() {
  return (
    <div className="flex flex-col gap-5 rounded-xl border border-dashed border-border px-6 py-10 text-center">
      <span
        aria-hidden
        className="mx-auto grid size-12 place-items-center rounded-xl bg-muted text-muted-foreground [&_svg]:size-6"
      >
        <LuBuilding2 />
      </span>

      <div className="space-y-1.5">
        <p className="font-medium">No organizations yet</p>
        <p className="text-sm text-muted-foreground">
          Create one to start building workflows, or wait for a teammate&apos;s
          invitation to land in your inbox.
        </p>
      </div>
    </div>
  )
}

export function OrganizationSelectView({
  user,
  organizations,
  invitations,
  activeOrganizationId,
}: {
  user: AuthUser
  organizations: OrganizationSummary[]
  invitations: IncomingInvitation[]
  activeOrganizationId?: string | null
}) {
  const hasOrganizations = organizations.length > 0

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <OrganizationTopbar user={user} />

      <main className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)]">
        <section className="px-6 py-12 sm:px-12 lg:py-20">
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-10">
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Choose an organization
              </h1>
              <p className="text-muted-foreground">
                Select where you want to continue.
              </p>
            </div>

            <IncomingInvitations invitations={invitations} />

            {hasOrganizations ? (
              <OrganizationList
                organizations={organizations}
                activeOrganizationId={activeOrganizationId}
              />
            ) : (
              <EmptyOrganizations />
            )}
          </div>
        </section>

        <section className="border-t border-border px-6 py-12 sm:px-12 lg:border-t-0 lg:border-l lg:py-20">
          <div className="mx-auto flex w-full max-w-md flex-col gap-8">
            <div className="flex items-start gap-4">
              <span
                aria-hidden
                className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-600 text-white [&_svg]:size-5.5"
              >
                <LuPlus />
              </span>

              <div className="space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Create organization
                </h2>
                <p className="text-sm text-muted-foreground">
                  Start a new shared workspace.
                </p>
              </div>
            </div>

            <CreateOrganizationForm />

            <div className="flex items-center gap-4">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                or
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <Link
              href={ORGANIZATION_ROUTES.join}
              className="group flex items-center gap-4 rounded-xl border border-border px-4 py-3.5 transition-colors hover:border-foreground/20 hover:bg-muted/40"
            >
              <span
                aria-hidden
                className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:text-foreground [&_svg]:size-5"
              >
                <LuHash />
              </span>

              <span className="flex min-w-0 flex-col">
                <span className="text-sm font-medium">Join with a code</span>
                <span className="text-sm text-muted-foreground">
                  Someone shared a six-digit code with you.
                </span>
              </span>
            </Link>

            <OrganizationTeamPreview className="pt-2" />
          </div>
        </section>
      </main>
    </div>
  )
}
