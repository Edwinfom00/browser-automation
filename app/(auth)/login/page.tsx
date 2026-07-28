import type { Metadata } from "next"

import { requireAnonymous } from "@/modules/auth/server/session"
import { LoginView } from "@/modules/auth/ui/views/login-view"

export const metadata: Metadata = {
  title: "Sign in · Browser Automation",
  description: "Sign in to continue building workflows.",
}

export default async function LoginPage() {
  await requireAnonymous()

  return <LoginView />
}
