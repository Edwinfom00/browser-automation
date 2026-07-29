import { cn } from "@/lib/utils"
import { roleLabel } from "@/modules/organizations/lib/roles"
import type { OrganizationSummary } from "@/modules/organizations/types"
import { OrganizationLogo } from "@/modules/organizations/ui/components/organization-logo"

export function OrganizationOption({
  organization,
  isSelected,
  disabled,
  onSelect,
}: {
  organization: OrganizationSummary
  isSelected: boolean
  disabled?: boolean
  onSelect: () => void
}) {
  const { id, name, slug, logo, role, memberCount } = organization

  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-4 rounded-xl border px-4 py-3.5 transition-colors",
        isSelected
          ? "border-violet-500 bg-violet-500/[0.06]"
          : "border-border hover:border-foreground/20 hover:bg-muted/40",
        disabled && "pointer-events-none opacity-60"
      )}
    >
      <input
        type="radio"
        name="organization"
        value={id}
        checked={isSelected}
        disabled={disabled}
        onChange={onSelect}
        className="sr-only"
      />

      <OrganizationLogo id={id} name={name} logo={logo} />

      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-medium">{name}</span>
        <span className="truncate text-sm text-muted-foreground">
          {roleLabel(role)} · /{slug}
        </span>
      </span>

      <span className="hidden shrink-0 text-sm text-muted-foreground sm:inline">
        {memberCount} {memberCount === 1 ? "member" : "members"}
      </span>

      <span
        aria-hidden
        className={cn(
          "grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors",
          isSelected ? "border-violet-500" : "border-border"
        )}
      >
        <span
          className={cn(
            "size-2 rounded-full bg-violet-500 transition-opacity",
            isSelected ? "opacity-100" : "opacity-0"
          )}
        />
      </span>
    </label>
  )
}
