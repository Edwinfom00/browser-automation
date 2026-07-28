import { z } from "zod"

import { PASSWORD_MIN_LENGTH } from "@/modules/auth/constants"

export const signInSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean(),
})

export const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your full name")
    .max(64, "Keep your name under 64 characters"),
  email: z.email("Enter a valid email address"),
  password: z
    .string()
    .min(
      PASSWORD_MIN_LENGTH,
      `Use at least ${PASSWORD_MIN_LENGTH} characters`
    ),
  acceptTerms: z
    .boolean()
    .refine((accepted) => accepted, "Accept the terms to continue"),
})

export const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email address"),
})

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(
        PASSWORD_MIN_LENGTH,
        `Use at least ${PASSWORD_MIN_LENGTH} characters`
      ),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  })

export const socialProviderSchema = z.enum(["google", "github"])
