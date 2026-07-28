import type { Metadata } from "next"

import { requireAnonymous } from "@/modules/auth/server/session"
import { ForgotPasswordView } from "@/modules/auth/ui/views/forgot-password-view"

export const metadata: Metadata = {
  title: "Forgot password · Browser Automation",
  description: "Request a link to reset your Browser Automation password.",
}

export default async function ForgotPasswordPage() {
  await requireAnonymous()

  return <ForgotPasswordView />
}
