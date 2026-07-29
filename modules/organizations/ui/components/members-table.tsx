"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import {
  LuCrown,
  LuEllipsis,
  LuLoaderCircle,
  LuTriangleAlert,
  LuUserMinus,
} from "react-icons/lu"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useOrganizationMembers } from "@/modules/organizations/hooks/use-organization-members"
import { initials } from "@/modules/organizations/lib/initials"
import { primaryRole } from "@/modules/organizations/lib/roles"
import type {
  AssignableOrganizationRole,
  OrganizationMember,
  OrganizationViewer,
} from "@/modules/organizations/types"
import { MemberRoleSelect } from "@/modules/organizations/ui/components/member-role-select"
import { RemoveMemberDialog } from "@/modules/organizations/ui/components/remove-member-dialog"
import { RoleBadge } from "@/modules/organizations/ui/components/role-badge"
import { TransferOwnershipDialog } from "@/modules/organizations/ui/components/transfer-ownership-dialog"

export function MembersTable({
  members,
  viewer,
}: {
  members: OrganizationMember[]
  viewer: OrganizationViewer
}) {
  const {
    changeRole,
    remove,
    transferOwnership,
    pendingId,
    isPending,
    error,
    clearError,
  } = useOrganizationMembers()

  const [memberToRemove, setMemberToRemove] =
    useState<OrganizationMember | null>(null)
  const [memberToPromote, setMemberToPromote] =
    useState<OrganizationMember | null>(null)

  return (
    <div className="flex flex-col gap-4">
      {error ? (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
        >
          <LuTriangleAlert className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead className="hidden sm:table-cell">Joined</TableHead>
              <TableHead className="text-right">Role</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {members.map((member) => {
              const role = primaryRole(member.role)
              const isViewer = member.id === viewer.memberId
              const isOwner = role === "owner"
              const isRowPending = pendingId === member.id

              // Owners are edited through the transfer flow, and nobody
              // demotes themselves from this table.
              const canEditRole =
                viewer.canManageMembers && !isViewer && !isOwner
              const canRemove = viewer.canManageMembers && !isViewer && !isOwner
              const canPromote = viewer.canTransferOwnership && !isViewer

              return (
                <TableRow key={member.id} data-pending={isRowPending}>
                  <TableCell>
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="size-9">
                        {member.user.image ? (
                          <AvatarImage src={member.user.image} alt="" />
                        ) : null}
                        <AvatarFallback className="bg-violet-600 text-xs font-semibold text-white">
                          {initials(member.user.name, member.user.email)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-medium">
                          {member.user.name || member.user.email}
                          {isViewer ? (
                            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                              (you)
                            </span>
                          ) : null}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {member.user.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="hidden text-sm whitespace-nowrap text-muted-foreground sm:table-cell">
                    {formatDistanceToNow(member.createdAt, { addSuffix: true })}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isRowPending ? (
                        <LuLoaderCircle className="size-4 animate-spin text-muted-foreground" />
                      ) : null}

                      {canEditRole ? (
                        <MemberRoleSelect
                          value={role as AssignableOrganizationRole}
                          disabled={isPending}
                          ariaLabel={`Role for ${member.user.name || member.user.email}`}
                          onChange={(next) => {
                            clearError()
                            void changeRole(member.id, next)
                          }}
                        />
                      ) : (
                        <RoleBadge role={role} />
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    {canRemove || canPromote ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isPending}
                            aria-label={`Actions for ${member.user.name || member.user.email}`}
                            className="size-8 text-muted-foreground"
                          >
                            <LuEllipsis />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-56">
                          {canPromote ? (
                            <DropdownMenuItem
                              onSelect={() => {
                                clearError()
                                setMemberToPromote(member)
                              }}
                            >
                              <LuCrown />
                              Transfer ownership
                            </DropdownMenuItem>
                          ) : null}

                          {canRemove ? (
                            <DropdownMenuItem
                              variant="destructive"
                              onSelect={() => {
                                clearError()
                                setMemberToRemove(member)
                              }}
                            >
                              <LuUserMinus />
                              Remove from organization
                            </DropdownMenuItem>
                          ) : null}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : null}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <RemoveMemberDialog
        member={memberToRemove}
        isPending={isPending}
        onConfirm={async (memberId) => {
          const didRemove = await remove(memberId)

          if (didRemove) {
            setMemberToRemove(null)
          }
        }}
        onOpenChange={(open) => {
          if (!open) {
            setMemberToRemove(null)
          }
        }}
      />

      <TransferOwnershipDialog
        member={memberToPromote}
        isPending={isPending}
        onConfirm={async (memberId) => {
          const didTransfer = await transferOwnership(memberId)

          if (didTransfer) {
            setMemberToPromote(null)
          }
        }}
        onOpenChange={(open) => {
          if (!open) {
            setMemberToPromote(null)
          }
        }}
      />
    </div>
  )
}
