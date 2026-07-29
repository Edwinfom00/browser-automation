"use client"

import { LuCrown, LuLoaderCircle } from "react-icons/lu"

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

export function TransferOwnershipDialog({
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
          <AlertDialogMedia className="text-violet-500">
            <LuCrown />
          </AlertDialogMedia>

          <AlertDialogTitle>Make {label} the owner?</AlertDialogTitle>
          <AlertDialogDescription>
            They take full control of this organization, including deleting it.
            You step down to admin and can&apos;t undo this on your own.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>

          <Button
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
            Transfer ownership
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
