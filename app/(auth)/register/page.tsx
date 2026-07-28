import type { Metadata } from "next"

import { requireAnonymous } from "@/modules/auth/server/session"
import { RegisterView } from "@/modules/auth/ui/views/register-view"

export const metadata: Metadata = {
  title: "Create your account · Browser Automation",
  description: "Create a Browser Automation account and start building workflows.",
}

export default async function RegisterPage() {
  await requireAnonymous()

  return <RegisterView />
}
