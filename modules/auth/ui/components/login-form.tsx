"use client"

import { useState } from "react"
import Link from "next/link"
import {
  LuEye,
  LuEyeOff,
  LuLoaderCircle,
  LuTriangleAlert,
} from "react-icons/lu"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AUTH_ROUTES } from "@/modules/auth/constants"
import { useSignIn } from "@/modules/auth/hooks/use-sign-in"
import { SocialAuthButtons } from "@/modules/auth/ui/components/social-auth-buttons"

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const { submit, isPending, error, fieldErrors, clearFieldError } = useSignIn({
    redirectTo,
  })

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        void submit({ email, password, rememberMe })
      }}
      className="flex flex-col gap-5"
    >
      {error ? (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
        >
          <LuTriangleAlert className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? "email-error" : undefined}
          onChange={(event) => {
            setEmail(event.target.value)
            clearFieldError("email")
          }}
          className="h-12 rounded-lg px-3.5 text-base md:text-base"
        />
        {fieldErrors.email ? (
          <p id="email-error" className="text-sm text-destructive">
            {fieldErrors.email}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={
              fieldErrors.password ? "password-error" : undefined
            }
            onChange={(event) => {
              setPassword(event.target.value)
              clearFieldError("password")
            }}
            className="h-12 rounded-lg px-3.5 pr-11 text-base md:text-base"
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            {showPassword ? (
              <LuEyeOff className="size-4.5" />
            ) : (
              <LuEye className="size-4.5" />
            )}
          </button>
        </div>
        {fieldErrors.password ? (
          <p id="password-error" className="text-sm text-destructive">
            {fieldErrors.password}
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <Checkbox
            id="remember-me"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked === true)}
          />
          <Label htmlFor="remember-me" className="font-normal">
            Remember me
          </Label>
        </div>
        <Link
          href={AUTH_ROUTES.forgotPassword}
          className="text-sm font-medium text-blue-500 transition-colors hover:text-blue-400"
        >
          Forgot password?
        </Link>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="h-12 w-full rounded-lg bg-blue-600 text-base font-semibold text-white hover:bg-blue-500"
      >
        {isPending ? <LuLoaderCircle className="size-4.5 animate-spin" /> : null}
        Sign in
      </Button>

      <div className="flex items-center gap-4 py-1">
        <span className="h-px flex-1 bg-border" />
        <span className="text-sm text-muted-foreground">or continue with</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <SocialAuthButtons disabled={isPending} callbackURL={redirectTo} />

      <p className="pt-2 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link
          href={AUTH_ROUTES.register}
          className="font-medium text-blue-500 transition-colors hover:text-blue-400"
        >
          Create an account
        </Link>
      </p>
    </form>
  )
}
