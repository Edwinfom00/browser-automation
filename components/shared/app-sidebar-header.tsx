"use client"

import {
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import type { OrganizationSummary } from "@/modules/organizations/types"
import { OrganizationSwitcher } from "@/modules/organizations/ui/components/organization-switcher"

export function AppSidebarHeader({
  organizations,
  activeOrganizationId,
}: {
  organizations: OrganizationSummary[]
  activeOrganizationId?: string | null
}) {
  const { state, isMobile } = useSidebar()

  const iconOnly = state === "collapsed" && !isMobile

  return (
    <SidebarHeader
      className={cn(
        "p-2",
        iconOnly ? "flex-col items-center gap-2" : "flex-row items-center gap-1"
      )}
    >
      {iconOnly ? (
        <OrganizationSwitcher
          organizations={organizations}
          activeOrganizationId={activeOrganizationId}
          variant="icon"
        />
      ) : (
        <div className="flex min-w-0 flex-1">
          <OrganizationSwitcher
            organizations={organizations}
            activeOrganizationId={activeOrganizationId}
            variant="compact"
          />
        </div>
      )}

      <SidebarTrigger className="shrink-0 text-muted-foreground" />
    </SidebarHeader>
  )
}
