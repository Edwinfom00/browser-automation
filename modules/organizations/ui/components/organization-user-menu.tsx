"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LuEllipsis, LuLoaderCircle, LuLogOut } from "react-icons/lu"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "@/lib/auth-client"
import { AUTH_ROUTES } from "@/modules/auth/constants"
import { initials } from "@/modules/organizations/lib/initials"

export type OrganizationUserMenuVariant = "default" | "compact"

export function OrganizationUserMenu({
  name,
  email,
  image,
  variant = "default",
}: {
  name: string
  email: string
  image?: string | null
  variant?: OrganizationUserMenuVariant
}) {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    await signOut()
    router.push(AUTH_ROUTES.login)
    router.refresh()
  }

  const isCompact = variant === "compact"

  const avatar = (
    // Compact stays 8 so it still fits the collapsed icon rail.
    <Avatar className={isCompact ? "size-8" : "size-9"}>
      {image ? <AvatarImage src={image} alt="" /> : null}
      <AvatarFallback className="bg-violet-600 text-xs font-semibold text-white">
        {initials(name, email)}
      </AvatarFallback>
    </Avatar>
  )

  const menu = (
    <DropdownMenuContent
      align={isCompact ? "start" : "end"}
      side={isCompact ? "top" : "bottom"}
      className="w-60"
    >
      <DropdownMenuLabel className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">{name || "Your account"}</span>
        <span className="truncate text-xs font-normal text-muted-foreground">
          {email}
        </span>
      </DropdownMenuLabel>

      <DropdownMenuSeparator />

      <DropdownMenuItem
        variant="destructive"
        disabled={isSigningOut}
        onSelect={(event) => {
          event.preventDefault()
          void handleSignOut()
        }}
      >
        {isSigningOut ? (
          <LuLoaderCircle className="animate-spin" />
        ) : (
          <LuLogOut />
        )}
        Sign out
      </DropdownMenuItem>
    </DropdownMenuContent>
  )


  if (isCompact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Account menu"
            className="size-8 rounded-full p-0 hover:bg-transparent"
          >
            {avatar}
          </Button>
        </DropdownMenuTrigger>

        {menu}
      </DropdownMenu>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {avatar}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Account menu"
            className="size-9 rounded-lg text-muted-foreground"
          >
            <LuEllipsis className="size-5" />
          </Button>
        </DropdownMenuTrigger>

        {menu}
      </DropdownMenu>
    </div>
  )
}
