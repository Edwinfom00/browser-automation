"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import {
  LuCheck,
  LuCopy,
  LuHash,
  LuLoaderCircle,
  LuRefreshCw,
  LuTrash2,
  LuTriangleAlert,
} from "react-icons/lu"

import { Button } from "@/components/ui/button"
import {
  INVITE_CODE_EXPIRES_IN_DAYS,
  INVITE_CODE_LENGTH,
  ORGANIZATION_ROUTES,
  ORGANIZATION_URL_HOST,
} from "@/modules/organizations/constants"
import { useInviteCode } from "@/modules/organizations/hooks/use-invite-code"
import { roleLabel } from "@/modules/organizations/lib/roles"
import type {
  ActiveInviteCode,
  AssignableOrganizationRole,
} from "@/modules/organizations/types"
import { InviteCodeDisplay } from "@/modules/organizations/ui/components/invite-code-display"
import { RoleRadioGroup } from "@/modules/organizations/ui/components/role-radio-group"

function assignableRole(role: string): AssignableOrganizationRole {
  return role === "admin" ? "admin" : "member"
}

export function InviteCodePanel({
  code,
}: {
  code: ActiveInviteCode | null
}) {
  const { generate, revoke, copy, isCopied, task, isPending, error } =
    useInviteCode(code?.code ?? null)

  const [role, setRole] = useState<AssignableOrganizationRole>(
    assignableRole(code?.role ?? "member")
  )

  return (
    <div className="flex flex-col gap-6">
      {error ? (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
        >
          <LuTriangleAlert className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {code ? (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-muted/30 px-4 py-6">
            <InviteCodeDisplay code={code.code} />

            <div className="flex flex-col items-center gap-1 text-center">
              <p className="text-sm text-muted-foreground">
                Joins as{" "}
                <span className="font-medium text-foreground">
                  {roleLabel(code.role).toLowerCase()}
                </span>{" "}
                · expires{" "}
                {formatDistanceToNow(code.expiresAt, { addSuffix: true })}
              </p>
              <p className="text-xs text-muted-foreground">
                {code.usedCount === 0
                  ? "Nobody has used it yet"
                  : `Used ${code.usedCount} ${code.usedCount === 1 ? "time" : "times"}`}
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => void copy()}
              className="mx-auto"
            >
              {isCopied ? <LuCheck className="text-emerald-500" /> : <LuCopy />}
              {isCopied ? "Copied" : "Copy code"}
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Send them to{" "}
            <span className="font-mono text-foreground">
              {ORGANIZATION_URL_HOST}
              {ORGANIZATION_ROUTES.join}
            </span>{" "}
            and have them type the {INVITE_CODE_LENGTH} digits. Anyone with the
            code can join, so rotate it when you&apos;re done sharing.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => void generate(role)}
            >
              {task === "generate" ? (
                <LuLoaderCircle className="animate-spin" />
              ) : (
                <LuRefreshCw />
              )}
              New code
            </Button>

            <Button
              type="button"
              variant="ghost"
              disabled={isPending}
              onClick={() => void revoke()}
              className="text-muted-foreground hover:text-destructive"
            >
              {task === "revoke" ? (
                <LuLoaderCircle className="animate-spin" />
              ) : (
                <LuTrash2 />
              )}
              Turn off
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-8 text-center">
            <span
              aria-hidden
              className="grid size-11 place-items-center rounded-xl bg-muted text-muted-foreground [&_svg]:size-5"
            >
              <LuHash />
            </span>

            <div className="space-y-1">
              <p className="text-sm font-medium">No code yet</p>
              <p className="text-sm text-muted-foreground">
                Generate one and anyone who types it joins this workspace — no
                email needed. It expires after {INVITE_CODE_EXPIRES_IN_DAYS}{" "}
                days.
              </p>
            </div>
          </div>

          <RoleRadioGroup
            name="invite-code-role"
            legend="They join as"
            value={role}
            onChange={setRole}
            disabled={isPending}
          />

          <Button
            type="button"
            disabled={isPending}
            onClick={() => void generate(role)}
          >
            {task === "generate" ? (
              <LuLoaderCircle className="animate-spin" />
            ) : null}
            Generate code
          </Button>
        </div>
      )}
    </div>
  )
}
