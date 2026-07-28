import type { z } from "zod"

import type { Session } from "@/lib/auth"
import type {
  signInSchema,
  socialProviderSchema,
} from "@/modules/auth/validators"

export type SignInInput = z.infer<typeof signInSchema>

export type SocialProvider = z.infer<typeof socialProviderSchema>


export type FieldErrors<TValues> = Partial<Record<keyof TValues, string>>

export type SignInFieldErrors = FieldErrors<SignInInput>

export type AuthSession = Session

export type AuthUser = Session["user"]
