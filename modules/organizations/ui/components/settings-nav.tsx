"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LuBuilding2, LuUsers } from "react-icons/lu"

import { cn } from "@/lib/utils"
import { ORGANIZATION_ROUTES } from "@/modules/organizations/constants"

const LINKS = [
  {
    href: ORGANIZATION_ROUTES.settings,
    label: "General",
    icon: LuBuilding2,
  },
  {
    href: ORGANIZATION_ROUTES.members,
    label: "Members",
    icon: LuUsers,
  },
] as const

export function SettingsNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Organization settings" className="flex gap-1 border-b border-border">
      {LINKS.map((link) => {
        const isActive = pathname === link.href

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "-mb-px flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "border-violet-500 text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <link.icon className="size-4" />
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
