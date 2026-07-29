import { Suspense } from "react"
import { cookies } from "next/headers"

import { AppSidebar } from "@/components/shared/app-sidebar"
import { AppSidebarSkeleton } from "@/components/shared/app-sidebar-skeleton"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { requireSession } from "@/modules/auth/server/session"
import type { AuthSession } from "@/modules/auth/types"
import { getOrganizationSwitcherData } from "@/modules/organizations/server/organizations"
import { getOrganizationWorkflows } from "@/modules/workflows/server/workflows"

const SIDEBAR_COOKIE_NAME = "sidebar_state"

async function DashboardSidebar({ session }: { session: AuthSession }) {
  const [{ organizations, activeOrganizationId }, workflows] =
    await Promise.all([
      getOrganizationSwitcherData(session),
      getOrganizationWorkflows(session),
    ])

  return (
    <AppSidebar
      organizations={organizations}
      activeOrganizationId={activeOrganizationId}
      workflows={workflows}
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }}
    />
  )
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireSession()

  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get(SIDEBAR_COOKIE_NAME)?.value !== "false"

  return (
    <SidebarProvider defaultOpen={defaultOpen} className="h-svh">
      <Suspense fallback={<AppSidebarSkeleton />}>
        <DashboardSidebar session={session} />
      </Suspense>

      <SidebarInset className="min-h-0 overflow-hidden border shadow-none!">
        <main className="flex flex-1 flex-col p-6 sm:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
