import {
  adminClient,
  organizationClient,
  twoFactorClient,
} from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

import { ac, roles } from "@/modules/organizations/lib/permissions"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:3000",
  plugins: [
    twoFactorClient(),
    // Passing the same access control the server uses lets
    // `organization.checkRolePermission` gate UI without a round trip.
    organizationClient({ ac, roles }),
    adminClient(),
  ],
})

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  requestPasswordReset,
  resetPassword,
  sendVerificationEmail,
  twoFactor,
  organization,
  admin,
} = authClient
