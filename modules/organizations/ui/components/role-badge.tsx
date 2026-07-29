import { LuCrown, LuShield, LuUser } from "react-icons/lu"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { primaryRole, roleLabel } from "@/modules/organizations/lib/roles"
import type { OrganizationRole } from "@/modules/organizations/types"

const TONES: Record<OrganizationRole, string> = {
  owner: "bg-violet-500/12 text-violet-500",
  admin: "bg-blue-500/12 text-blue-500",
  member: "bg-muted text-muted-foreground",
}

const ICONS: Record<OrganizationRole, React.ComponentType> = {
  owner: LuCrown,
  admin: LuShield,
  member: LuUser,
}

export function RoleBadge({
  role,
  className,
}: {
  role: string | null | undefined
  className?: string
}) {
  const resolved = primaryRole(role)
  const Icon = ICONS[resolved]

  return (
    <Badge variant="secondary" className={cn(TONES[resolved], className)}>
      <Icon />
      {roleLabel(resolved)}
    </Badge>
  )
}
