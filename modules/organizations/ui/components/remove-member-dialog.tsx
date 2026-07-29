"use client"

import { LuLoaderCircle, LuUserMinus } from "react-icons/lu"

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
import type { OrganizationMember } from "@/modules/organizations/types"

export function RemoveMemberDialog({
  member,
  isPending,
  onConfirm,
  onOpenChange,
}: {
  member: OrganizationMember | null
  isPending: boolean
  onConfirm: (memberId: string) => void
  onOpenChange: (open: boolean) => void
}) {
  const label = member?.user.name || member?.user.email

  return (
    <AlertDialog
      open={member !== null}
      onOpenChange={(open) => {
        if (isPending) {
          return
        }

        onOpenChange(open)
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="text-destructive">
            <LuUserMinus />
          </AlertDialogMedia>

          <AlertDialogTitle>Remove {label}?</AlertDialogTitle>
          <AlertDialogDescription>
            They lose access to every workflow in this organization right away.
            Their work stays put, and you can invite them back later.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>

          <Button
            variant="destructive"
            disabled={isPending || !member}
            onClick={() => {
              if (member) {
                onConfirm(member.id)
              }
            }}
          >
            {isPending ? (
              <LuLoaderCircle className="size-4 animate-spin" />
            ) : null}
            Remove member
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
