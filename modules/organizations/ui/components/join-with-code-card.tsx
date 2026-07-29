"use client"

import { useState } from "react"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { LuLoaderCircle, LuTriangleAlert } from "react-icons/lu"

import { Button } from "@/components/ui/button"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { cn } from "@/lib/utils"
import { INVITE_CODE_LENGTH } from "@/modules/organizations/constants"
import { useJoinWithCode } from "@/modules/organizations/hooks/use-join-with-code"
import { normalizeInviteCode } from "@/modules/organizations/lib/invite-code"

const HALF = Math.ceil(INVITE_CODE_LENGTH / 2)

const SLOT_CLASS =
  "size-13 rounded-xl border-l bg-background text-2xl font-semibold tabular-nums transition-[color,box-shadow,border-color,background-color] first:rounded-xl last:rounded-xl data-[active=true]:bg-violet-500/[0.06] sm:size-14 sm:text-3xl dark:bg-input/20"

function slotRange(from: number, to: number) {
  return Array.from({ length: to - from }, (_, index) => from + index)
}

export function JoinWithCodeCard({ className }: { className?: string }) {
  const { submit, isPending, error, clearError } = useJoinWithCode()
  const [code, setCode] = useState("")

  const isComplete = code.length === INVITE_CODE_LENGTH

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        void submit(code)
      }}
      className={cn("flex flex-col gap-5", className)}
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

      <div className="flex flex-col items-center gap-3">
        <InputOTP
          autoFocus
          maxLength={INVITE_CODE_LENGTH}
          pattern={REGEXP_ONLY_DIGITS}
          inputMode="numeric"
          value={code}
          disabled={isPending}
          aria-label={`${INVITE_CODE_LENGTH}-digit invite code`}
          aria-invalid={Boolean(error)}
          containerClassName="gap-3"
          pasteTransformer={normalizeInviteCode}
          onChange={(value) => {
            setCode(value)
            clearError()
          }}
          onComplete={(value) => void submit(value)}
        >
          <InputOTPGroup className="gap-2.5">
            {slotRange(0, HALF).map((index) => (
              <InputOTPSlot
                key={index}
                index={index}
                className={SLOT_CLASS}
              />
            ))}
          </InputOTPGroup>

          <InputOTPSeparator />

          <InputOTPGroup className="gap-2.5">
            {slotRange(HALF, INVITE_CODE_LENGTH).map((index) => (
              <InputOTPSlot
                key={index}
                index={index}
                className={SLOT_CLASS}
              />
            ))}
          </InputOTPGroup>
        </InputOTP>

        <p className="text-sm text-muted-foreground">
          Paste or type the code your admin shared.
        </p>
      </div>

      <Button
        type="submit"
        disabled={isPending || !isComplete}
        className="h-12 w-full rounded-lg bg-violet-600 text-base font-semibold text-white hover:bg-violet-500"
      >
        {isPending ? (
          <LuLoaderCircle className="size-4.5 animate-spin" />
        ) : null}
        Join workspace
      </Button>
    </form>
  )
}
