"use client"

import Link from "next/link"
import { LuEllipsis, LuPencil, LuTrash2 } from "react-icons/lu"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { workflowPath } from "@/modules/workflows/lib/paths"
import type { WorkflowSummary } from "@/modules/workflows/types"


export function WorkflowNavItem({
  workflow,
  isActive,
  onRename,
  onDelete,
}: {
  workflow: WorkflowSummary
  isActive: boolean
  onRename: (workflow: WorkflowSummary) => void
  onDelete: (workflow: WorkflowSummary) => void
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={workflow.name}>
        <Link href={workflowPath(workflow.id)}>
          <span className="truncate">{workflow.name}</span>
        </Link>
      </SidebarMenuButton>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuAction
            showOnHover
            aria-label={`Options for ${workflow.name}`}
          >
            <LuEllipsis />
          </SidebarMenuAction>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="right" align="start" className="min-w-40">
          <DropdownMenuItem onSelect={() => onRename(workflow)}>
            <LuPencil />
            Rename
          </DropdownMenuItem>

          <DropdownMenuItem
            variant="destructive"
            onSelect={() => onDelete(workflow)}
          >
            <LuTrash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}
