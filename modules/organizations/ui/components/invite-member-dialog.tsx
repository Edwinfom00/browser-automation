"use client"

import { useState } from "react"
import { LuLoaderCircle, LuTriangleAlert, LuUserPlus } from "react-icons/lu"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ASSIGNABLE_ORGANIZATION_ROLES,
  ORGANIZATION_ROLE_META,
} from "@/modules/organizations/constants"
import { useInviteMember } from "@/modules/organizations/hooks/use-organization-invitations"
import type { AssignableOrganizationRole } from "@/modules/organizations/types"

export function InviteMemberDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<AssignableOrganizationRole>("member")

  const { submit, reset, clearFieldError, isPending, error, fieldErrors } =
    useInviteMember({
      onInvited: () => {
        setIsOpen(false)
        setEmail("")
        setRole("member")
      },
    })

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (isPending) {
          return
        }

        if (!open) {
          reset()
        }

        setIsOpen(open)
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <LuUserPlus />
          Invite member
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            void submit({ email, role })
          }}
          className="flex flex-col gap-6"
        >
          <DialogHeader>
            <DialogTitle>Invite a teammate</DialogTitle>
            <DialogDescription>
              We&apos;ll email them a link that expires in seven days. They join
              once they accept it.
            </DialogDescription>
          </DialogHeader>

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
            <Label htmlFor="invite-email">Email address</Label>
            <Input
              id="invite-email"
              type="email"
              autoComplete="off"
              placeholder="teammate@company.com"
              value={email}
              disabled={isPending}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={
                fieldErrors.email ? "invite-email-error" : undefined
              }
              onChange={(event) => {
                setEmail(event.target.value)
                clearFieldError("email")
              }}
              className="h-11"
            />
            {fieldErrors.email ? (
              <p id="invite-email-error" className="text-sm text-destructive">
                {fieldErrors.email}
              </p>
            ) : null}
          </div>

          <fieldset className="flex flex-col gap-2" disabled={isPending}>
            <legend className="mb-2 text-sm font-medium">Role</legend>

            {ASSIGNABLE_ORGANIZATION_ROLES.map((option) => (
              <label
                key={option}
                className={
                  "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors " +
                  (role === option
                    ? "border-violet-500 bg-violet-500/[0.06]"
                    : "border-border hover:border-foreground/20 hover:bg-muted/40")
                }
              >
                <input
                  type="radio"
                  name="invite-role"
                  value={option}
                  checked={role === option}
                  onChange={() => setRole(option)}
                  className="sr-only"
                />

                <span
                  aria-hidden
                  className={
                    "mt-0.5 grid size-4.5 shrink-0 place-items-center rounded-full border-2 transition-colors " +
                    (role === option ? "border-violet-500" : "border-border")
                  }
                >
                  <span
                    className={
                      "size-2 rounded-full bg-violet-500 transition-opacity " +
                      (role === option ? "opacity-100" : "opacity-0")
                    }
                  />
                </span>

                <span className="flex min-w-0 flex-col">
                  <span className="text-sm font-medium">
                    {ORGANIZATION_ROLE_META[option].label}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {ORGANIZATION_ROLE_META[option].description}
                  </span>
                </span>
              </label>
            ))}
          </fieldset>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <LuLoaderCircle className="size-4 animate-spin" />
              ) : null}
              Send invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
