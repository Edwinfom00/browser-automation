"use client"

import type { IconType } from "react-icons"
import { FaGithub } from "react-icons/fa6"
import { FcGoogle } from "react-icons/fc"
import { LuLoaderCircle } from "react-icons/lu"

import { Button } from "@/components/ui/button"
import { useSocialSignIn } from "@/modules/auth/hooks/use-social-sign-in"
import type { SocialProvider } from "@/modules/auth/types"

const PROVIDERS: { id: SocialProvider; label: string; icon: IconType }[] = [
  { id: "google", label: "Google", icon: FcGoogle },
  { id: "github", label: "GitHub", icon: FaGithub },
]

export function SocialAuthButtons({
  disabled,
  callbackURL,
}: {
  disabled?: boolean
  callbackURL?: string
}) {
  const { signInWith, pendingProvider, error } = useSocialSignIn({ callbackURL })

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        {PROVIDERS.map(({ id, label, icon: Icon }) => {
          const isPending = pendingProvider === id

          return (
            <Button
              key={id}
              type="button"
              variant="outline"
              onClick={() => signInWith(id)}
              disabled={disabled || pendingProvider !== null}
              className="h-12 gap-2.5 rounded-lg text-sm font-medium [&_svg:not([class*='size-'])]:size-4.5"
            >
              {isPending ? <LuLoaderCircle className="animate-spin" /> : <Icon />}
              {label}
            </Button>
          )
        })}
      </div>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}
