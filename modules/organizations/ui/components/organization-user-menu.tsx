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

function initials(name: string, email: string): string {
  const source = name.trim() || email

  return source
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

export function OrganizationUserMenu({
  name,
  email,
  image,
}: {
  name: string
  email: string
  image?: string | null
}) {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    await signOut()
    router.push(AUTH_ROUTES.login)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      <Avatar className="size-9">
        {image ? <AvatarImage src={image} alt="" /> : null}
        <AvatarFallback className="bg-violet-600 text-xs font-semibold text-white">
          {initials(name, email)}
        </AvatarFallback>
      </Avatar>

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

        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">
              {name || "Your account"}
            </span>
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
      </DropdownMenu>
    </div>
  )
}
