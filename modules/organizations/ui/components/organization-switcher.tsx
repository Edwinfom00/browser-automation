"use client"

import { useState } from "react"
import Link from "next/link"
import {
  LuCheck,
  LuChevronsUpDown,
  LuLoaderCircle,
  LuPlus,
  LuSettings,
  LuTriangleAlert,
} from "react-icons/lu"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import {
  ORGANIZATION_ROLE_LABELS,
  ORGANIZATION_ROUTES,
} from "@/modules/organizations/constants"
import { useSwitchOrganization } from "@/modules/organizations/hooks/use-switch-organization"
import type { OrganizationSummary } from "@/modules/organizations/types"
import { OrganizationLogo } from "@/modules/organizations/ui/components/organization-logo"

function roleLabel(role: string): string {
  return (
    ORGANIZATION_ROLE_LABELS[role] ??
    role.charAt(0).toUpperCase() + role.slice(1)
  )
}

/** Trigger shown when the session has no active organization to name yet. */
function EmptySwitcher() {
  return (
    <Button
      asChild
      variant="outline"
      className="h-14 w-full justify-start gap-3 rounded-xl px-3 sm:w-72"
    >
      <Link href={ORGANIZATION_ROUTES.select}>
        <span
          aria-hidden
          className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-muted text-muted-foreground [&_svg]:size-4.5"
        >
          <LuPlus />
        </span>
        <span className="flex min-w-0 flex-1 flex-col items-start">
          <span className="truncate text-sm font-medium">
            Select organization
          </span>
          <span className="truncate text-xs font-normal text-muted-foreground">
            None active yet
          </span>
        </span>
      </Link>
    </Button>
  )
}

export function OrganizationSwitcher({
  organizations,
  activeOrganizationId,
  className,
}: {
  organizations: OrganizationSummary[]
  activeOrganizationId?: string | null
  className?: string
}) {
  const { switchTo, pendingId, isPending, error, clearError } =
    useSwitchOrganization()
  const [isOpen, setIsOpen] = useState(false)

  const active = organizations.find(
    (candidate) => candidate.id === activeOrganizationId
  )

  if (!active) {
    return <EmptySwitcher />
  }

  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={(next) => {
        setIsOpen(next)

        if (!next) {
          clearError()
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          aria-label={`Current organization: ${active.name}. Switch organization`}
          className={cn(
            "h-14 w-full justify-start gap-3 rounded-xl px-3 sm:w-72",
            className
          )}
        >
          <OrganizationLogo
            id={active.id}
            name={active.name}
            logo={active.logo}
            size="sm"
          />

          <span className="flex min-w-0 flex-1 flex-col items-start">
            <span className="w-full truncate text-left text-sm font-medium">
              {active.name}
            </span>
            <span className="w-full truncate text-left text-xs font-normal text-muted-foreground">
              {roleLabel(active.role)} · /{active.slug}
            </span>
          </span>

          {isPending ? (
            <LuLoaderCircle className="size-4 shrink-0 animate-spin text-muted-foreground" />
          ) : (
            <LuChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="min-w-72"
      >
        <DropdownMenuLabel className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
          Organizations
        </DropdownMenuLabel>

        {error ? (
          <div
            role="alert"
            className="mx-1 mb-1 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1.5 text-xs text-destructive"
          >
            <LuTriangleAlert className="mt-px size-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        {organizations.map((organization) => {
          const isActive = organization.id === active.id

          return (
            <DropdownMenuItem
              key={organization.id}
              disabled={isPending}
              className="gap-3 py-2"
              onSelect={(event) => {
                if (isActive) {
                  return
                }

                // Keep the menu open so a failed switch can report itself.
                event.preventDefault()

                void switchTo(organization.id).then((didSwitch) => {
                  if (didSwitch) {
                    setIsOpen(false)
                  }
                })
              }}
            >
              <OrganizationLogo
                id={organization.id}
                name={organization.name}
                logo={organization.logo}
                size="sm"
                className="size-8 rounded-lg"
              />

              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">
                  {organization.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {organization.memberCount}{" "}
                  {organization.memberCount === 1 ? "member" : "members"}
                </span>
              </span>

              {pendingId === organization.id ? (
                <LuLoaderCircle className="size-4 shrink-0 animate-spin text-muted-foreground" />
              ) : isActive ? (
                <LuCheck className="size-4 shrink-0 text-violet-500" />
              ) : null}
            </DropdownMenuItem>
          )
        })}

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href={ORGANIZATION_ROUTES.select}>
            <LuPlus />
            Create organization
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href={ORGANIZATION_ROUTES.select}>
            <LuSettings />
            Manage organizations
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
