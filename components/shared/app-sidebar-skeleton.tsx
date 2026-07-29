import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { WorkflowNavSkeleton } from "@/modules/workflows/ui/components/workflow-nav-skeleton"

export function AppSidebarSkeleton() {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="flex-row items-center gap-1 p-2 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1.5 py-1 group-data-[collapsible=icon]:flex-none group-data-[collapsible=icon]:px-0">
          <Skeleton className="size-7 shrink-0 rounded-lg" />
          <Skeleton className="h-3.5 w-28 group-data-[collapsible=icon]:hidden" />
        </div>

        <Skeleton className="size-7 shrink-0 rounded-md group-data-[collapsible=icon]:hidden" />
      </SidebarHeader>

      <SidebarContent>
        <WorkflowNavSkeleton />
      </SidebarContent>

      <SidebarFooter className="p-2 group-data-[collapsible=icon]:items-center">
        <div className="flex items-center gap-2 rounded-md px-1.5 py-1">
          <Skeleton className="size-8 shrink-0 rounded-full" />

          <div className="flex flex-1 flex-col gap-1.5 group-data-[collapsible=icon]:hidden">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-2.5 w-32" delay={80} />
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
