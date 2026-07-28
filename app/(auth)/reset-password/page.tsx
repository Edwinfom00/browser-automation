import type { Metadata } from "next"

import { ResetPasswordView } from "@/modules/auth/ui/views/reset-password-view"

export const metadata: Metadata = {
  title: "Reset password · Browser Automation",
  description: "Choose a new password for your Browser Automation account.",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
}


export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>
}) {
  const { token, error } = await searchParams

  return <ResetPasswordView token={token} error={error} />
}
