"use client"

import { useState } from "react"
import { LuLoaderCircle, LuTriangleAlert } from "react-icons/lu"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ORGANIZATION_URL_HOST } from "@/modules/organizations/constants"
import { useCreateOrganization } from "@/modules/organizations/hooks/use-create-organization"
import { normalizeSlugInput, slugify } from "@/modules/organizations/lib/slug"

export function CreateOrganizationForm({ disabled }: { disabled?: boolean }) {
  const {
    submit,
    isPending,
    error,
    fieldErrors,
    clearFieldError,
    checkSlugAvailability,
  } = useCreateOrganization()

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [isSlugEdited, setIsSlugEdited] = useState(false)

  const isBusy = isPending || disabled

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        void submit({ name, slug })
      }}
      className="flex flex-col gap-5"
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

      <div className="flex flex-col gap-2">
        <Label htmlFor="organization-name">Organization name</Label>
        <Input
          id="organization-name"
          name="organization-name"
          autoComplete="organization"
          placeholder="e.g. Acme Studio"
          value={name}
          disabled={isBusy}
          aria-invalid={Boolean(fieldErrors.name)}
          aria-describedby={
            fieldErrors.name ? "organization-name-error" : undefined
          }
          onChange={(event) => {
            const nextName = event.target.value
            setName(nextName)
            clearFieldError("name")

            if (!isSlugEdited) {
              setSlug(slugify(nextName))
              clearFieldError("slug")
            }
          }}
          className="h-12 rounded-lg px-3.5 text-base md:text-base"
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
          name="organization-slug"
          autoComplete="off"
          spellCheck={false}
          placeholder="acme-studio"
          value={slug}
          disabled={isBusy}
          aria-invalid={Boolean(fieldErrors.slug)}
          aria-describedby={
            fieldErrors.slug
              ? "organization-slug-error"
              : "organization-slug-hint"
          }
          onChange={(event) => {
            setIsSlugEdited(true)
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
          className="h-12 rounded-lg px-3.5 font-mono text-base md:text-base"
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

      <Button
        type="submit"
        disabled={isBusy}
        className="h-12 w-full rounded-lg bg-violet-600 text-base font-semibold text-white hover:bg-violet-500"
      >
        {isPending ? (
          <LuLoaderCircle className="size-4.5 animate-spin" />
        ) : null}
        Create organization
      </Button>

      <p className="text-sm text-muted-foreground">
        You can invite teammates after setup.
      </p>
    </form>
  )
}
