import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { admin, organization, twoFactor } from "better-auth/plugins"

import { db } from "@/lib/db"
import { emailLayout, sendEmail } from "@/lib/email"

const appName = "Browser Automation"

const baseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000"

export const auth = betterAuth({
  appName,
  baseURL,
  database: drizzleAdapter(db, { provider: "pg" }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 12,
    resetPasswordTokenExpiresIn: 60 * 60,
    // A reset is the recovery path after a suspected compromise — drop every
    // session so an attacker's cookie dies with the old password.
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: `Reset your ${appName} password`,
        html: emailLayout({
          heading: "Reset your password",
          body: "Click the button below to choose a new password. This link expires in one hour. If you didn't request this, you can ignore this email.",
          action: { label: "Reset password", url },
        }),
      })
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: `Verify your ${appName} email`,
        html: emailLayout({
          heading: "Verify your email",
          body: `Confirm ${user.email} to finish setting up your ${appName} account.`,
          action: { label: "Verify email", url },
        }),
      })
    },
  },

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  account: {
    accountLinking: {
      enabled: true,
      // Only link automatically for providers that verify the email themselves.
      trustedProviders: ["github", "google"],
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },

  plugins: [
    twoFactor({
      issuer: appName,
      otpOptions: {
        sendOTP: async ({ user, otp }) => {
          await sendEmail({
            to: user.email,
            subject: `Your ${appName} verification code`,
            html: emailLayout({
              heading: "Your verification code",
              body: `Enter <strong>${otp}</strong> to finish signing in. It expires in a few minutes.`,
            }),
          })
        },
      },
    }),
    organization({
      sendInvitationEmail: async ({ id, email, organization, inviter }) => {
        const url = `${baseURL}/accept-invitation/${id}`
        await sendEmail({
          to: email,
          subject: `Join ${organization.name} on ${appName}`,
          html: emailLayout({
            heading: `Join ${organization.name}`,
            body: `${inviter.user.name || inviter.user.email} invited you to join ${organization.name} on ${appName}.`,
            action: { label: "Accept invitation", url },
          }),
        })
      },
    }),
    admin(),
    // Must stay last — it forwards Set-Cookie from server actions.
    nextCookies(),
  ],

  rateLimit: {
    enabled: true,
    // Persisted so limits hold across serverless instances.
    storage: "database",
    window: 10,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 3 },
      "/request-password-reset": { window: 60, max: 3 },
      "/reset-password": { window: 60, max: 5 },
      "/two-factor/verify-otp": { window: 60, max: 5 },
      "/two-factor/verify-totp": { window: 60, max: 5 },
      "/two-factor/verify-backup-code": { window: 60, max: 5 },
    },
  },

  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },

  trustedOrigins: [baseURL],
})

export type Session = typeof auth.$Infer.Session
