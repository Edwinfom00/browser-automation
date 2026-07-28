import { Button } from "@/components/ui/button"
import { requireSession } from "@/modules/auth/server/session"
import { getOrganizationSwitcherData } from "@/modules/organizations/server/organizations"
import { OrganizationSwitcher } from "@/modules/organizations/ui/components/organization-switcher"
import { OrganizationUserMenu } from "@/modules/organizations/ui/components/organization-user-menu"

export default async function Page() {
  const session = await requireSession()
  const { organizations, activeOrganizationId } =
    await getOrganizationSwitcherData(session)

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="flex items-center justify-between gap-4 border-b border-border px-6 py-3.5 sm:px-8">
        <OrganizationSwitcher
          organizations={organizations}
          activeOrganizationId={activeOrganizationId}
        />

        <OrganizationUserMenu
          name={session.user.name}
          email={session.user.email}
          image={session.user.image}
        />
      </header>

      <main className="flex flex-1 p-6 sm:p-8">
        <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
          <div>
            <h1 className="font-medium">Project ready!</h1>
            <p>You may now add components and start building.</p>
            <p>We&apos;ve already added the button component for you.</p>
            <Button className="mt-2">Button</Button>
          </div>
          <div className="font-mono text-xs text-muted-foreground">
            (Press <kbd>d</kbd> to toggle dark mode)
          </div>
        </div>
      </main>
    </div>
  )
}
