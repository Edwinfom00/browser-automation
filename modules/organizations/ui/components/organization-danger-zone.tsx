"use client"

import { useState } from "react"
import {
  LuDoorOpen,
  LuLoaderCircle,
  LuTrash2,
  LuTriangleAlert,
} from "react-icons/lu"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLeaveOrganization } from "@/modules/organizations/hooks/use-leave-organization"
import type {
  OrganizationSummary,
  OrganizationViewer,
} from "@/modules/organizations/types"

type Intent = "leave" | "delete"

export function OrganizationDangerZone({
  organization,
  viewer,
}: {
  organization: OrganizationSummary
  viewer: OrganizationViewer
}) {
  const { leave, remove, isPending, error, clearError } =
    useLeaveOrganization()

  const [intent, setIntent] = useState<Intent | null>(null)
  const [confirmation, setConfirmation] = useState("")

  const isDelete = intent === "delete"
  const canConfirmDelete = confirmation === organization.slug

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-destructive/30 p-5">
      <div className="space-y-1">
        <h3 className="font-medium">Danger zone</h3>
        <p className="text-sm text-muted-foreground">
          These actions affect everyone in {organization.name}.
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <p className="text-sm font-medium">Leave organization</p>
          <p className="text-sm text-muted-foreground">
            {viewer.canLeave
              ? "You lose access until someone invites you back."
              : "As the only owner, hand ownership over before you leave."}
          </p>
        </div>

        <Button
          variant="outline"
          disabled={!viewer.canLeave || isPending}
          className="shrink-0"
          onClick={() => {
            clearError()
            setIntent("leave")
          }}
        >
          <LuDoorOpen />
          Leave
        </Button>
      </div>

      {viewer.canDeleteOrganization ? (
        <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">Delete organization</p>
            <p className="text-sm text-muted-foreground">
              Removes every workflow, member and invitation. Permanently.
            </p>
          </div>

          <Button
            variant="destructive"
            disabled={isPending}
            className="shrink-0"
            onClick={() => {
              clearError()
              setConfirmation("")
              setIntent("delete")
            }}
          >
            <LuTrash2 />
            Delete
          </Button>
        </div>
      ) : null}

      <AlertDialog
        open={intent !== null}
        onOpenChange={(open) => {
          if (isPending) {
            return
          }

          if (!open) {
            setIntent(null)
            setConfirmation("")
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="text-destructive">
              {isDelete ? <LuTrash2 /> : <LuDoorOpen />}
            </AlertDialogMedia>

            <AlertDialogTitle>
              {isDelete
                ? `Delete ${organization.name}?`
                : `Leave ${organization.name}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isDelete
                ? "Every workflow, member and pending invitation goes with it. This can't be undone."
                : "You'll need a new invitation to get back in. Your workflows stay with the organization."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {isDelete ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="delete-confirmation">
                Type <span className="font-mono">{organization.slug}</span> to
                confirm
              </Label>
              <Input
                id="delete-confirmation"
                autoComplete="off"
                spellCheck={false}
                value={confirmation}
                disabled={isPending}
                onChange={(event) => setConfirmation(event.target.value)}
                className="h-11 font-mono"
              />
            </div>
          ) : null}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>

            <Button
              variant="destructive"
              disabled={isPending || (isDelete && !canConfirmDelete)}
              onClick={() => {
                void (isDelete ? remove() : leave())
              }}
            >
              {isPending ? (
                <LuLoaderCircle className="size-4 animate-spin" />
              ) : null}
              {isDelete ? "Delete organization" : "Leave organization"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
