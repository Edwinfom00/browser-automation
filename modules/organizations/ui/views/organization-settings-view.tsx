import type { OrganizationManageData } from "@/modules/organizations/types"
import { OrganizationDangerZone } from "@/modules/organizations/ui/components/organization-danger-zone"
import { OrganizationGeneralForm } from "@/modules/organizations/ui/components/organization-general-form"
import { RoleBadge } from "@/modules/organizations/ui/components/role-badge"

export function OrganizationSettingsView({
  organization,
  viewer,
}: Pick<OrganizationManageData, "organization" | "viewer">) {
  return (
    <div className="flex max-w-2xl flex-col gap-10">
      <section className="flex flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-medium">General</h2>
            <p className="text-sm text-muted-foreground">
              How this organization shows up across the app.
            </p>
          </div>

          <RoleBadge role={viewer.role} className="mt-1 shrink-0" />
        </div>

        <OrganizationGeneralForm
          organization={organization}
          canEdit={viewer.canUpdateOrganization}
        />
      </section>

      <OrganizationDangerZone organization={organization} viewer={viewer} />
    </div>
  )
}
