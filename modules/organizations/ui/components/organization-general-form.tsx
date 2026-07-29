"use client"

import { useState } from "react"
import { LuCheck, LuLoaderCircle, LuTriangleAlert } from "react-icons/lu"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ORGANIZATION_URL_HOST } from "@/modules/organizations/constants"
import { useUpdateOrganization } from "@/modules/organizations/hooks/use-update-organization"
import { normalizeSlugInput, slugify } from "@/modules/organizations/lib/slug"
import type { OrganizationSummary } from "@/modules/organizations/types"
import { OrganizationLogo } from "@/modules/organizations/ui/components/organization-logo"

export function OrganizationGeneralForm({
  organization,
  canEdit,
}: {
  organization: OrganizationSummary
  canEdit: boolean
}) {
  const {
    submit,
    checkSlugAvailability,
    clearFieldError,
    isPending,
    error,
    fieldErrors,
    savedAt,
  } = useUpdateOrganization(organization.slug)

  const [name, setName] = useState(organization.name)
  const [slug, setSlug] = useState(organization.slug)
  const [logo, setLogo] = useState(organization.logo ?? "")

  const isDirty =
    name !== organization.name ||
    slug !== organization.slug ||
    logo !== (organization.logo ?? "")

  const isBusy = isPending || !canEdit

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        void submit({ name, slug, logo })
      }}
      className="flex flex-col gap-6"
    >
      {error ? (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
        >
          <LuTriangleAlert className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="flex items-center gap-4">
        <OrganizationLogo
          id={organization.id}
          name={name || organization.name}
          logo={logo || null}
          size="lg"
        />

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Label htmlFor="organization-logo">Logo URL</Label>
          <Input
            id="organization-logo"
            autoComplete="off"
            spellCheck={false}
            placeholder="https://example.com/logo.png"
            value={logo}
            disabled={isBusy}
            aria-invalid={Boolean(fieldErrors.logo)}
            aria-describedby={
              fieldErrors.logo ? "organization-logo-error" : undefined
            }
            onChange={(event) => {
              setLogo(event.target.value)
              clearFieldError("logo")
            }}
            className="h-11"
          />
          {fieldErrors.logo ? (
            <p id="organization-logo-error" className="text-sm text-destructive">
              {fieldErrors.logo}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="organization-name">Organization name</Label>
        <Input
          id="organization-name"
          autoComplete="organization"
          value={name}
          disabled={isBusy}
          aria-invalid={Boolean(fieldErrors.name)}
          aria-describedby={
            fieldErrors.name ? "organization-name-error" : undefined
          }
          onChange={(event) => {
            setName(event.target.value)
            clearFieldError("name")
          }}
          className="h-11"
        />
        {fieldErrors.name ? (
          <p id="organization-name-error" className="text-sm text-destructive">
            {fieldErrors.name}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="organization-slug">Organization slug</Label>
        <Input
          id="organization-slug"
          autoComplete="off"
          spellCheck={false}
          value={slug}
          disabled={isBusy}
          aria-invalid={Boolean(fieldErrors.slug)}
          aria-describedby={
            fieldErrors.slug ? "organization-slug-error" : "organization-slug-hint"
          }
          onChange={(event) => {
            setSlug(normalizeSlugInput(event.target.value))
            clearFieldError("slug")
          }}
          onBlur={() => {
            const normalized = slugify(slug)
            setSlug(normalized)

            if (normalized) {
              void checkSlugAvailability(normalized)
            }
          }}
          className="h-11 font-mono"
        />
        {fieldErrors.slug ? (
          <p id="organization-slug-error" className="text-sm text-destructive">
            {fieldErrors.slug}
          </p>
        ) : (
          <p
            id="organization-slug-hint"
            className="truncate text-sm text-muted-foreground"
          >
            {ORGANIZATION_URL_HOST}/
            <span className="text-violet-400">{slug || "your-org"}</span>
          </p>
        )}
      </div>

      {canEdit ? (
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isPending || !isDirty}>
            {isPending ? (
              <LuLoaderCircle className="size-4 animate-spin" />
            ) : null}
            Save changes
          </Button>

          {savedAt && !isDirty ? (
            <span
              role="status"
              className="flex items-center gap-1.5 text-sm text-emerald-500"
            >
              <LuCheck className="size-4" />
              Saved
            </span>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Only owners and admins can change these details.
        </p>
      )}
    </form>
  )
}
