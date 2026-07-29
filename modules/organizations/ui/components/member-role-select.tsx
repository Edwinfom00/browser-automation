"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ASSIGNABLE_ORGANIZATION_ROLES,
  ORGANIZATION_ROLE_META,
} from "@/modules/organizations/constants"
import type { AssignableOrganizationRole } from "@/modules/organizations/types"

export function MemberRoleSelect({
  value,
  disabled,
  ariaLabel,
  onChange,
}: {
  value: AssignableOrganizationRole
  disabled?: boolean
  ariaLabel: string
  onChange: (role: AssignableOrganizationRole) => void
}) {
  return (
    <Select
      value={value}
      disabled={disabled}
      onValueChange={(next) => onChange(next as AssignableOrganizationRole)}
    >
      <SelectTrigger size="sm" aria-label={ariaLabel} className="w-28">
        <SelectValue />
      </SelectTrigger>

      <SelectContent align="end">
        {ASSIGNABLE_ORGANIZATION_ROLES.map((role) => (
          <SelectItem key={role} value={role}>
            {ORGANIZATION_ROLE_META[role].label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
