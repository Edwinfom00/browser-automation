import type { Metadata } from "next"

import { AUTH_ROUTES } from "@/modules/auth/constants"
import { requireSession } from "@/modules/auth/server/session"
import { ORGANIZATION_ROUTES } from "@/modules/organizations/constants"
import { JoinWithCodeView } from "@/modules/organizations/ui/views/join-with-code-view"

export const metadata: Metadata = {
  title: "Join with a code · Browser Automation",
  description: "Enter the code your admin shared to join their workspace.",
  robots: { index: false, follow: false },
}

export default async function JoinWithCodePage() {
  const session = await requireSession(
    `${AUTH_ROUTES.login}?redirectTo=${encodeURIComponent(ORGANIZATION_ROUTES.join)}`
  )

  return <JoinWithCodeView user={session.user} />
}
