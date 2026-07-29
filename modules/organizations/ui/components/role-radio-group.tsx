"use client"

import {
  ASSIGNABLE_ORGANIZATION_ROLES,
  ORGANIZATION_ROLE_META,
} from "@/modules/organizations/constants"
import type { AssignableOrganizationRole } from "@/modules/organizations/types"

export function RoleRadioGroup({
  name,
  legend,
  value,
  onChange,
  disabled,
}: {
  name: string
  legend: string
  value: AssignableOrganizationRole
  onChange: (role: AssignableOrganizationRole) => void
  disabled?: boolean
}) {
  return (
    <fieldset className="flex flex-col gap-2" disabled={disabled}>
      <legend className="mb-2 text-sm font-medium">{legend}</legend>

      {ASSIGNABLE_ORGANIZATION_ROLES.map((option) => (
        <label
          key={option}
          className={
            "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors " +
            (value === option
              ? "border-violet-500 bg-violet-500/[0.06]"
              : "border-border hover:border-foreground/20 hover:bg-muted/40")
          }
        >
          <input
            type="radio"
            name={name}
            value={option}
            checked={value === option}
            onChange={() => onChange(option)}
            className="sr-only"
          />

          <span
            aria-hidden
            className={
              "mt-0.5 grid size-4.5 shrink-0 place-items-center rounded-full border-2 transition-colors " +
              (value === option ? "border-violet-500" : "border-border")
            }
          >
            <span
              className={
                "size-2 rounded-full bg-violet-500 transition-opacity " +
                (value === option ? "opacity-100" : "opacity-0")
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
  )
}
