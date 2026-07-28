import { LuBuilding2 } from "react-icons/lu"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const TONES = [
  "bg-violet-600",
  "bg-emerald-500",
  "bg-blue-600",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
] as const

const boxStyles = {
  sm: "size-9 rounded-[10px]",
  md: "size-11 rounded-xl",
  lg: "size-14 rounded-2xl",
} as const

const iconStyles = {
  sm: "[&_svg]:size-4.5",
  md: "[&_svg]:size-5.5",
  lg: "[&_svg]:size-7",
} as const

export type OrganizationLogoSize = keyof typeof boxStyles


export function toneForId(id: string): string {
  let hash = 0

  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) >>> 0
  }

  return TONES[hash % TONES.length]
}

export function OrganizationLogo({
  id,
  name,
  logo,
  size = "md",
  className,
}: {
  id: string
  name: string
  logo?: string | null
  size?: OrganizationLogoSize
  className?: string
}) {
  const tone = toneForId(id)

  if (logo) {
    return (
      <Avatar className={cn("after:rounded-xl", boxStyles[size], className)}>
        <AvatarImage src={logo} alt="" className="rounded-[inherit]" />
        <AvatarFallback
          className={cn("rounded-[inherit] text-white uppercase", tone)}
        >
          {name.slice(0, 2)}
        </AvatarFallback>
      </Avatar>
    )
  }

  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center text-white",
        tone,
        boxStyles[size],
        iconStyles[size],
        className
      )}
    >
      <LuBuilding2 />
    </span>
  )
}
