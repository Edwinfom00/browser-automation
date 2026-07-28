"use client"

import { useState } from "react"
import Link from "next/link"
import {
  LuArrowLeft,
  LuLoaderCircle,
  LuMailCheck,
  LuTriangleAlert,
} from "react-icons/lu"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AUTH_ROUTES } from "@/modules/auth/constants"
import { useForgotPassword } from "@/modules/auth/hooks/use-forgot-password"

export function ForgotPasswordForm() {
  const {
    submit,
    isPending,
    error,
    fieldErrors,
    clearFieldError,
    submittedEmail,
    resend,
    isResending,
    resentAt,
  } = useForgotPassword()

  const [email, setEmail] = useState("")

  if (submittedEmail) {
    return (
      <div className="flex flex-col gap-5">
        <span
          aria-hidden
          className="grid size-12 place-items-center rounded-xl bg-blue-600/10 text-blue-500 [&_svg]:size-6"
        >
          <LuMailCheck />
        </span>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Check your inbox
          </h2>
          <p className="text-muted-foreground">
            If an account exists for{" "}
            <span className="font-medium text-foreground">{submittedEmail}</span>
            , we sent a link to reset your password. It expires in one hour.
          </p>
        </div>

        {error ? (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
          >
            <LuTriangleAlert className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        {resentAt ? (
          <p role="status" className="text-sm text-muted-foreground">
            Reset email sent again.
          </p>
        ) : null}

        <Button
          type="button"
          variant="outline"
          disabled={isResending}
          onClick={() => void resend()}
          className="h-12 w-full rounded-lg text-base font-medium"
        >
          {isResending ? (
            <LuLoaderCircle className="size-4.5 animate-spin" />
          ) : null}
          Resend reset email
        </Button>

        <Link
          href={AUTH_ROUTES.login}
          className="inline-flex items-center justify-center gap-2 text-sm font-medium text-blue-500 transition-colors hover:text-blue-400"
        >
          <LuArrowLeft className="size-4" />
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        void submit({ email })
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
          autoFocus
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

      <Button
        type="submit"
        disabled={isPending}
        className="h-12 w-full rounded-lg bg-blue-600 text-base font-semibold text-white hover:bg-blue-500"
      >
        {isPending ? <LuLoaderCircle className="size-4.5 animate-spin" /> : null}
        Send reset link
      </Button>

      <Link
        href={AUTH_ROUTES.login}
        className="inline-flex items-center justify-center gap-2 text-sm font-medium text-blue-500 transition-colors hover:text-blue-400"
      >
        <LuArrowLeft className="size-4" />
        Back to sign in
      </Link>
    </form>
  )
}
