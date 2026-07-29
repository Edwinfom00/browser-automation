import { SettingsNav } from "@/modules/organizations/ui/components/settings-nav"
import { requireActiveOrganization } from "@/modules/organizations/server/organizations"

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Redirects to the picker when the session has no organization behind it.
  const organization = await requireActiveOrganization()

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-10 sm:px-8">
        <header className="space-y-1">
          <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Organization
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            {organization.name}
          </h1>
        </header>

        <SettingsNav />

        {children}
      </div>
    </div>
  )
}
