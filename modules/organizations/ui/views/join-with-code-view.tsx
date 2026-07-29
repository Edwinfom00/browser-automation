import Link from "next/link"
import { LuArrowLeft, LuHash } from "react-icons/lu"

import type { AuthUser } from "@/modules/auth/types"
import {
  INVITE_CODE_LENGTH,
  ORGANIZATION_ROUTES,
} from "@/modules/organizations/constants"
import { JoinWithCodeCard } from "@/modules/organizations/ui/components/join-with-code-card"
import { OrganizationTopbar } from "@/modules/organizations/ui/components/organization-topbar"

export function JoinWithCodeView({ user }: { user: AuthUser }) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <OrganizationTopbar user={user} />

      <main className="flex flex-1 items-center justify-center px-6 py-12 sm:px-12">
        <div className="flex w-full max-w-md flex-col gap-8">
          <div className="flex flex-col items-center gap-5 text-center">
            <span
              aria-hidden
              className="grid size-14 place-items-center rounded-2xl bg-violet-600 text-white [&_svg]:size-7"
            >
              <LuHash />
            </span>

            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight">
                Enter your invite code
              </h1>
              <p className="text-muted-foreground">
                The {INVITE_CODE_LENGTH} digits an admin shared with you. You
                join as {user.email}.
              </p>
            </div>
          </div>

          <JoinWithCodeCard />

          <Link
            href={ORGANIZATION_ROUTES.select}
            className="mx-auto inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <LuArrowLeft className="size-4" />
            Back to your organizations
          </Link>
        </div>
      </main>
    </div>
  )
}
