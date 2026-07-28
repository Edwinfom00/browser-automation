import type { AuthUser } from "@/modules/auth/types"
import { AuthBrand } from "@/modules/auth/ui/components/auth-brand"
import { OrganizationUserMenu } from "@/modules/organizations/ui/components/organization-user-menu"

export function OrganizationTopbar({ user }: { user: AuthUser }) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-border px-6 py-3.5 sm:px-8">
      <AuthBrand size="sm" />

      <OrganizationUserMenu
        name={user.name}
        email={user.email}
        image={user.image}
      />
    </header>
  )
}
