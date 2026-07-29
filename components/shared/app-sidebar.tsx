"use client"

import { useState } from "react"
import { LuPlus, LuWorkflow } from "react-icons/lu"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import type { OrganizationSummary } from "@/modules/organizations/types"
import { OrganizationSwitcher } from "@/modules/organizations/ui/components/organization-switcher"
import { OrganizationUserMenu } from "@/modules/organizations/ui/components/organization-user-menu"

/** Placeholder until workflows are persisted. */
const WORKFLOWS = [
  { id: "dominant-wasp", name: "dominant-wasp" },
  { id: "honest-reindeer", name: "honest-reindeer" },
  { id: "expected-llama", name: "expected-llama" },
  { id: "essential-ocelot", name: "essential-ocelot" },
  { id: "creepy-echidna", name: "creepy-echidna" },
  { id: "eastern-silkworm", name: "eastern-silkworm" },
  { id: "cultural-lion", name: "cultural-lion" },
  { id: "proud-weasel", name: "proud-weasel" },
  { id: "regional-bonobo", name: "regional-bonobo" },
] as const

export function AppSidebar({
  organizations,
  activeOrganizationId,
  user,
}: {
  organizations: OrganizationSummary[]
  activeOrganizationId?: string | null
  user: {
    name: string
    email: string
    image?: string | null
  }
}) {
  const [selectedId, setSelectedId] = useState<string>(WORKFLOWS[0].id)
  const { state, isMobile } = useSidebar()


  const iconOnly = state === "collapsed" && !isMobile

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader
        className={cn(
          "p-2",
          iconOnly
            ? "flex-col items-center gap-2"
            : "flex-row items-center gap-1"
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

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workflows</SidebarGroupLabel>

          <SidebarGroupAction aria-label="New workflow">
            <LuPlus />
          </SidebarGroupAction>

          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {WORKFLOWS.map((workflow) => (
                <SidebarMenuItem key={workflow.id}>
                  <SidebarMenuButton
                    isActive={workflow.id === selectedId}
                    tooltip={workflow.name}
                    onClick={() => setSelectedId(workflow.id)}
                  >
                    <LuWorkflow />
                    <span>{workflow.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className={cn("p-2", iconOnly && "items-center")}>
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
