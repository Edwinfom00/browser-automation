"use client"

import { useState } from "react"
import Link from "next/link"
import {
  LuEye,
  LuEyeOff,
  LuLoaderCircle,
  LuMailCheck,
  LuTriangleAlert,
} from "react-icons/lu"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AUTH_ROUTES,
  LEGAL_ROUTES,
  PASSWORD_MIN_LENGTH,
} from "@/modules/auth/constants"
import { useSignUp } from "@/modules/auth/hooks/use-sign-up"
import { SocialAuthButtons } from "@/modules/auth/ui/components/social-auth-buttons"

export function RegisterForm({ redirectTo }: { redirectTo?: string }) {
  const {
    submit,
    isPending,
    error,
    fieldErrors,
    clearFieldError,
    registeredEmail,
    resendVerification,
    isResending,
    resentAt,
  } = useSignUp({ redirectTo })

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  if (registeredEmail) {
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
            We sent a verification link to{" "}
            <span className="font-medium text-foreground">
              {registeredEmail}
            </span>
            . Open it to activate your account and continue setup.
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
            Verification email sent again.
          </p>
        ) : null}

        <Button
          type="button"
          variant="outline"
          disabled={isResending}
          onClick={() => void resendVerification()}
          className="h-12 w-full rounded-lg text-base font-medium"
        >
          {isResending ? (
            <LuLoaderCircle className="size-4.5 animate-spin" />
          ) : null}
          Resend verification email
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already verified?{" "}
          <Link
            href={AUTH_ROUTES.login}
            className="font-medium text-blue-500 transition-colors hover:text-blue-400"
          >
            Sign in
          </Link>
        </p>
      </div>
    )
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        void submit({ name, email, password, acceptTerms })
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
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Maya Chen"
          value={name}
          aria-invalid={Boolean(fieldErrors.name)}
          aria-describedby={fieldErrors.name ? "name-error" : undefined}
          onChange={(event) => {
            setName(event.target.value)
            clearFieldError("name")
          }}
          className="h-12 rounded-lg px-3.5 text-base md:text-base"
        />
        {fieldErrors.name ? (
          <p id="name-error" className="text-sm text-destructive">
            {fieldErrors.name}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Work email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="maya@company.com"
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
            autoComplete="new-password"
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
        <div className="flex items-start gap-2.5">
          <Checkbox
            id="accept-terms"
            checked={acceptTerms}
            aria-invalid={Boolean(fieldErrors.acceptTerms)}
            aria-describedby={
              fieldErrors.acceptTerms ? "accept-terms-error" : undefined
            }
            onCheckedChange={(checked) => {
              setAcceptTerms(checked === true)
              clearFieldError("acceptTerms")
            }}
            className="mt-0.5"
          />
          <Label
            htmlFor="accept-terms"
            className="block leading-relaxed font-normal"
          >
            I agree to the{" "}
            <Link
              href={LEGAL_ROUTES.terms}
              onClick={(event) => event.stopPropagation()}
              className="font-medium text-blue-500 transition-colors hover:text-blue-400"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href={LEGAL_ROUTES.privacy}
              onClick={(event) => event.stopPropagation()}
              className="font-medium text-blue-500 transition-colors hover:text-blue-400"
            >
              Privacy Policy
            </Link>
          </Label>
        </div>
        {fieldErrors.acceptTerms ? (
          <p id="accept-terms-error" className="text-sm text-destructive">
            {fieldErrors.acceptTerms}
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="h-12 w-full rounded-lg bg-blue-600 text-base font-semibold text-white hover:bg-blue-500"
      >
        {isPending ? <LuLoaderCircle className="size-4.5 animate-spin" /> : null}
        Create account
      </Button>

      <div className="flex items-center gap-4 py-1">
        <span className="h-px flex-1 bg-border" />
        <span className="text-sm text-muted-foreground">or continue with</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <SocialAuthButtons disabled={isPending} callbackURL={redirectTo} />

      <p className="pt-2 text-center text-sm text-muted-foreground lg:hidden">
        Already have an account?{" "}
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
