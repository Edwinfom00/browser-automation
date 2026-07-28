
export const AUTH_ROUTES = {
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
} as const


export const LEGAL_ROUTES = {
  terms: "/terms",
  privacy: "/privacy",
} as const


export const DEFAULT_LOGIN_REDIRECT = "/"


export const PASSWORD_MIN_LENGTH = 12
