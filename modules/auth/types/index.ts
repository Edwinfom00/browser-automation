import type { z } from "zod"

import type { Session } from "@/lib/auth"
import type {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  socialProviderSchema,
} from "@/modules/auth/validators"

export type SignInInput = z.infer<typeof signInSchema>

export type SignUpInput = z.infer<typeof signUpSchema>

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

export type SocialProvider = z.infer<typeof socialProviderSchema>


export type FieldErrors<TValues> = Partial<Record<keyof TValues, string>>

export type SignInFieldErrors = FieldErrors<SignInInput>

export type SignUpFieldErrors = FieldErrors<SignUpInput>

export type ForgotPasswordFieldErrors = FieldErrors<ForgotPasswordInput>

export type ResetPasswordFieldErrors = FieldErrors<ResetPasswordInput>

export type AuthSession = Session

export type AuthUser = Session["user"]
