import { cookies } from "next/headers"

import { AppSidebar } from "@/components/shared/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { requireSession } from "@/modules/auth/server/session"
import { getOrganizationSwitcherData } from "@/modules/organizations/server/organizations"


const SIDEBAR_COOKIE_NAME = "sidebar_state"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireSession()
  const { organizations, activeOrganizationId } =
    await getOrganizationSwitcherData(session)


  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get(SIDEBAR_COOKIE_NAME)?.value !== "false"

  return (
    <SidebarProvider defaultOpen={defaultOpen} className="h-svh">
      <AppSidebar
        organizations={organizations}
        activeOrganizationId={activeOrganizationId}
        user={{
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        }}
      />

      <SidebarInset className="min-h-0 overflow-hidden border shadow-none!">
        <header className="flex h-14 shrink-0 items-center gap-2 px-4 md:hidden">
          <SidebarTrigger className="text-muted-foreground" />
        </header>

        <main className="flex flex-1 flex-col p-6 sm:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
