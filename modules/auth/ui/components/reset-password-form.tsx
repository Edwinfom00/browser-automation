"use client"

import { useState } from "react"
import Link from "next/link"
import {
  LuCircleCheck,
  LuEye,
  LuEyeOff,
  LuLoaderCircle,
  LuTriangleAlert,
} from "react-icons/lu"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AUTH_ROUTES, PASSWORD_MIN_LENGTH } from "@/modules/auth/constants"
import { useResetPassword } from "@/modules/auth/hooks/use-reset-password"

export function ResetPasswordForm({ token }: { token: string }) {
  const { submit, isPending, error, fieldErrors, clearFieldError, isDone } =
    useResetPassword({ token })

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  if (isDone) {
    return (
      <div className="flex flex-col gap-5">
        <span
          aria-hidden
          className="grid size-12 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500 [&_svg]:size-6"
        >
          <LuCircleCheck />
        </span>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Password updated
          </h2>
          <p className="text-muted-foreground">
            We signed you out everywhere else. Sign in with your new password to
            continue.
          </p>
        </div>

        <Button
          asChild
          className="h-12 w-full rounded-lg bg-blue-600 text-base font-semibold text-white hover:bg-blue-500"
        >
          <Link href={AUTH_ROUTES.login}>Sign in</Link>
        </Button>
      </div>
    )
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        void submit({ password, confirmPassword })
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
        <Label htmlFor="password">New password</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            autoFocus
            placeholder={`At least ${PASSWORD_MIN_LENGTH} characters`}
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

      <div className="flex flex-col gap-2">
        <Label htmlFor="confirm-password">Confirm new password</Label>
        <Input
          id="confirm-password"
          name="confirmPassword"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Re-enter your new password"
          value={confirmPassword}
          aria-invalid={Boolean(fieldErrors.confirmPassword)}
          aria-describedby={
            fieldErrors.confirmPassword ? "confirm-password-error" : undefined
          }
          onChange={(event) => {
            setConfirmPassword(event.target.value)
            clearFieldError("confirmPassword")
          }}
          className="h-12 rounded-lg px-3.5 text-base md:text-base"
        />
        {fieldErrors.confirmPassword ? (
          <p id="confirm-password-error" className="text-sm text-destructive">
            {fieldErrors.confirmPassword}
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="h-12 w-full rounded-lg bg-blue-600 text-base font-semibold text-white hover:bg-blue-500"
      >
        {isPending ? <LuLoaderCircle className="size-4.5 animate-spin" /> : null}
        Update password
      </Button>

      <p className="pt-2 text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link
          href={AUTH_ROUTES.login}
          className="font-medium text-blue-500 transition-colors hover:text-blue-400"
        >
          Sign in
        </Link>
      </p>
    </form>
  )
}
