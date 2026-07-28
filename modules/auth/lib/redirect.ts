import { DEFAULT_LOGIN_REDIRECT } from "@/modules/auth/constants"


export function sanitizeRedirect(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/")) {
    return DEFAULT_LOGIN_REDIRECT
  }

  
  if (value.startsWith("//") || value.startsWith("/\\")) {
    return DEFAULT_LOGIN_REDIRECT
  }

  return value
}
