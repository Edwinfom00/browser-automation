import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"

const ITEM_WIDTHS = ["w-[70%]", "w-[86%]", "w-[58%]", "w-[76%]", "w-[64%]"]

export function WorkflowNavSkeleton({ count = 5 }: { count?: number }) {
  return (
    <SidebarGroup
      role="status"
      aria-live="polite"
      aria-label="Loading workflows"
    >
      <div className="flex h-8 items-center px-2 group-data-[collapsible=icon]:justify-center">
        <Skeleton className="h-3 w-20 group-data-[collapsible=icon]:w-4" />
      </div>

      <SidebarGroupContent>
        <SidebarMenu className="gap-1">
          {Array.from({ length: count }, (_, index) => (
            <SidebarMenuItem key={index}>
              <div className="flex h-8 items-center px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
                <Skeleton
                  delay={index * 70}
                  className={`h-3.5 ${ITEM_WIDTHS[index % ITEM_WIDTHS.length]} group-data-[collapsible=icon]:w-5`}
                />
              </div>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
