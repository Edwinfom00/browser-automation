"use client"

import { useState } from "react"
import {
  LuLoaderCircle,
  LuPlus,
  LuTriangleAlert,
  LuWorkflow,
} from "react-icons/lu"

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
import { useCreateWorkflow } from "@/modules/workflows/hooks/use-create-workflow"
import { useWorkflowList } from "@/modules/workflows/hooks/use-workflow-list"
import type { WorkflowSummary } from "@/modules/workflows/types"
import { DeleteWorkflowDialog } from "@/modules/workflows/ui/components/delete-workflow-dialog"
import { RenameWorkflowDialog } from "@/modules/workflows/ui/components/rename-workflow-dialog"
import { WorkflowNavItem } from "@/modules/workflows/ui/components/workflow-nav-item"


export function WorkflowNav({ workflows }: { workflows: WorkflowSummary[] }) {
  const { state, isMobile } = useSidebar()
  const {
    workflows: visibleWorkflows,
    activeWorkflowId,
    isEmpty,
  } = useWorkflowList(workflows)

  const {
    submit: createWorkflow,
    isPending: isCreating,
    error: createError,
  } = useCreateWorkflow()

  const [renameTarget, setRenameTarget] = useState<WorkflowSummary | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<WorkflowSummary | null>(null)

  const collapsed = state === "collapsed" && !isMobile

  const workflowItems = visibleWorkflows.map((workflow) => (
    <WorkflowNavItem
      key={workflow.id}
      workflow={workflow}
      isActive={workflow.id === activeWorkflowId}
      onRename={setRenameTarget}
      onDelete={setDeleteTarget}
    />
  ))

  const emptyHint = (
    <p className="px-2 py-1.5 text-xs text-sidebar-foreground/60">
      No workflows yet. Create one to get started.
    </p>
  )

  const dialogs = (
    <>
      <RenameWorkflowDialog
        workflow={renameTarget}
        onOpenChange={(open) => {
          if (!open) {
            setRenameTarget(null)
          }
        }}
      />

      <DeleteWorkflowDialog
        workflow={deleteTarget}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null)
          }
        }}
      />
    </>
  )

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
                      <SidebarMenuButton
                        disabled={isCreating}
                        onClick={() => void createWorkflow()}
                      >
                        {isCreating ? (
                          <LuLoaderCircle className="animate-spin" />
                        ) : (
                          <LuPlus />
                        )}
                        <span>New workflow</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>

                  <SidebarSeparator className="mx-0" />

                  {isEmpty ? (
                    emptyHint
                  ) : (
                    <SidebarMenu className="gap-1">{workflowItems}</SidebarMenu>
                  )}
                </PopoverContent>
              </Popover>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>

        {dialogs}
      </SidebarGroup>
    )
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Workflows</SidebarGroupLabel>

      <SidebarGroupAction
        aria-label="New workflow"
        disabled={isCreating}
        onClick={() => void createWorkflow()}
      >
        {isCreating ? <LuLoaderCircle className="animate-spin" /> : <LuPlus />}
      </SidebarGroupAction>

      <SidebarGroupContent>
        {createError ? (
          <div
            role="alert"
            className="mx-2 mb-2 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1.5 text-xs text-destructive"
          >
            <LuTriangleAlert className="mt-px size-3.5 shrink-0" />
            <span>{createError}</span>
          </div>
        ) : null}

        {isEmpty ? (
          emptyHint
        ) : (
          <SidebarMenu className="gap-1">{workflowItems}</SidebarMenu>
        )}
      </SidebarGroupContent>

      {dialogs}
    </SidebarGroup>
  )
}
