import { AppSidebarHeader } from "@/components/shared/app-sidebar-header"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar"
import type { OrganizationSummary } from "@/modules/organizations/types"
import { OrganizationUserMenu } from "@/modules/organizations/ui/components/organization-user-menu"
import type { WorkflowSummary } from "@/modules/workflows/types"
import { WorkflowNav } from "@/modules/workflows/ui/components/workflow-nav"

export function AppSidebar({
  organizations,
  activeOrganizationId,
  workflows,
  user,
}: {
  organizations: OrganizationSummary[]
  activeOrganizationId?: string | null
  workflows: WorkflowSummary[]
  user: {
    name: string
    email: string
    image?: string | null
  }
}) {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <AppSidebarHeader
        organizations={organizations}
        activeOrganizationId={activeOrganizationId}
      />

      <SidebarContent>
        <WorkflowNav workflows={workflows} />
      </SidebarContent>

      <SidebarFooter className="p-2 group-data-[collapsible=icon]:items-center">
        <OrganizationUserMenu
          name={user.name}
          email={user.email}
          image={user.image}
          variant="compact"
        />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
