import { cn } from "@/lib/utils"
import { INVITE_CODE_LENGTH } from "@/modules/organizations/constants"
import {
  formatInviteCode,
  inviteCodeDigits,
} from "@/modules/organizations/lib/invite-code"


export function InviteCodeDisplay({
  code,
  className,
}: {
  code: string
  className?: string
}) {
  const digits = inviteCodeDigits(code)
  const half = Math.ceil(INVITE_CODE_LENGTH / 2)

  return (
    <div
      className={cn("flex items-center justify-center gap-2", className)}
      role="group"
      aria-label={`Invite code ${formatInviteCode(code)}`}
    >
      {digits.map((digit, index) => (
        <div key={index} className="flex items-center gap-2">
          <span
            className="grid size-11 place-items-center rounded-xl border border-violet-500/30 bg-violet-500/[0.07] font-mono text-xl font-semibold tabular-nums sm:size-12 sm:text-2xl"
            aria-hidden
          >
            {digit}
          </span>

          {index === half - 1 ? (
            <span aria-hidden className="mx-0.5 h-px w-2.5 bg-border" />
          ) : null}
        </div>
      ))}
    </div>
  )
}
