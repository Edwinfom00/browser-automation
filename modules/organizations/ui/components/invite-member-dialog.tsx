"use client"

import { useState } from "react"
import {
  LuHash,
  LuLoaderCircle,
  LuMail,
  LuTriangleAlert,
  LuUserPlus,
} from "react-icons/lu"

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useInviteMember } from "@/modules/organizations/hooks/use-organization-invitations"
import type {
  ActiveInviteCode,
  AssignableOrganizationRole,
} from "@/modules/organizations/types"
import { InviteCodePanel } from "@/modules/organizations/ui/components/invite-code-panel"
import { RoleRadioGroup } from "@/modules/organizations/ui/components/role-radio-group"

type InviteMethod = "email" | "code"

export function InviteMemberDialog({
  inviteCode,
}: {
  inviteCode: ActiveInviteCode | null
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [method, setMethod] = useState<InviteMethod>("email")
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
        <div className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>Invite a teammate</DialogTitle>
            <DialogDescription>
              Email them a private link, or share a code anyone can type to join.
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={method}
            onValueChange={(value) => setMethod(value as InviteMethod)}
            className="gap-6"
          >
            <TabsList className="w-full">
              <TabsTrigger value="email" disabled={isPending}>
                <LuMail />
                Email invite
              </TabsTrigger>
              <TabsTrigger value="code" disabled={isPending}>
                <LuHash />
                Invite code
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email">
              <form
                noValidate
                onSubmit={(event) => {
                  event.preventDefault()
                  void submit({ email, role })
                }}
                className="flex flex-col gap-6"
              >
                <p className="text-sm text-muted-foreground">
                  We&apos;ll email them a link that expires in seven days. They
                  join once they accept it.
                </p>

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
                    <p
                      id="invite-email-error"
                      className="text-sm text-destructive"
                    >
                      {fieldErrors.email}
                    </p>
                  ) : null}
                </div>

                <RoleRadioGroup
                  name="invite-role"
                  legend="Role"
                  value={role}
                  onChange={setRole}
                  disabled={isPending}
                />

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
            </TabsContent>

            <TabsContent value="code">
              <InviteCodePanel code={inviteCode} />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
