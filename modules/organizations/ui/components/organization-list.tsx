"use client"

import { useState } from "react"
import { LuLoaderCircle, LuTriangleAlert } from "react-icons/lu"

import { Button } from "@/components/ui/button"
import { useSelectOrganization } from "@/modules/organizations/hooks/use-select-organization"
import type { OrganizationSummary } from "@/modules/organizations/types"
import { OrganizationOption } from "@/modules/organizations/ui/components/organization-option"

export function OrganizationList({
  organizations,
  activeOrganizationId,
}: {
  organizations: OrganizationSummary[]
  activeOrganizationId?: string | null
}) {
  const { submit, isPending, error } = useSelectOrganization()

 
  const [selectedId, setSelectedId] = useState(
    () =>
      organizations.find((candidate) => candidate.id === activeOrganizationId)
        ?.id ??
      organizations[0]?.id ??
      ""
  )

  const selected = organizations.find(
    (candidate) => candidate.id === selectedId
  )

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        void submit(selectedId)
      }}
      className="flex flex-col gap-8"
    >
      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
          Your organizations / {String(organizations.length).padStart(2, "0")}
        </p>

        <div
          role="radiogroup"
          aria-label="Your organizations"
          className="flex flex-col gap-3"
        >
          {organizations.map((organization) => (
            <OrganizationOption
              key={organization.id}
              organization={organization}
              isSelected={organization.id === selectedId}
              disabled={isPending}
              onSelect={() => setSelectedId(organization.id)}
            />
          ))}
        </div>
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

      <Button
        type="submit"
        disabled={isPending || !selected}
        className="h-12 w-full rounded-lg bg-blue-600 text-base font-semibold text-white hover:bg-blue-500"
      >
        {isPending ? (
          <LuLoaderCircle className="size-4.5 animate-spin" />
        ) : null}
        {selected ? `Continue to ${selected.name}` : "Continue"}
      </Button>
    </form>
  )
}
