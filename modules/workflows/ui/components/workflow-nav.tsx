"use client"

import { useState } from "react"
import { LuPlus, LuWorkflow } from "react-icons/lu"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"

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

export function WorkflowNav() {
  const [selectedId, setSelectedId] = useState<string>(WORKFLOWS[0].id)
  const { state, isMobile } = useSidebar()

  const collapsed = state === "collapsed" && !isMobile

  const workflowItems = WORKFLOWS.map((workflow) => (
    <SidebarMenuItem key={workflow.id}>
      <SidebarMenuButton
        isActive={workflow.id === selectedId}
        onClick={() => setSelectedId(workflow.id)}
      >
        <span>{workflow.name}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  ))

  if (collapsed) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Popover>
                <PopoverTrigger asChild>
                  <SidebarMenuButton tooltip="Workflows">
                    <LuWorkflow />
                    <span>Workflows</span>
                  </SidebarMenuButton>
                </PopoverTrigger>

                <PopoverContent side="right" align="start" className="p-1">
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <LuPlus />
                        <span>New workflow</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>

                  <SidebarSeparator className="mx-0" />

                  <SidebarMenu className="gap-1">{workflowItems}</SidebarMenu>
                </PopoverContent>
              </Popover>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Workflows</SidebarGroupLabel>

      <SidebarGroupAction aria-label="New workflow">
        <LuPlus />
      </SidebarGroupAction>

      <SidebarGroupContent>
        <SidebarMenu className="gap-1">{workflowItems}</SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
