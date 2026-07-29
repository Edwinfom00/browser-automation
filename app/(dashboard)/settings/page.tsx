import { redirect } from "next/navigation"

import { ORGANIZATION_ROUTES } from "@/modules/organizations/constants"

export default function SettingsPage() {
  redirect(ORGANIZATION_ROUTES.settings)
}
